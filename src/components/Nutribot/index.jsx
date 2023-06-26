import { useEffect, useState } from "react";
import { Stack } from "../../primitives";
import { getRows } from "../../supabase";

const Nutribot = () => {
    const [isThinking, setIsThinking] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: "system",
            content:
                "You are a dietician’s assistant. You will provide clear, concise answers to the questions asked. You will meet any criteria asked of you. If requested, you will generate meal plans using only the recipes provided. These meal plans can contain as few as two meals per day. If a total kcal amount is specified, you will not exceed that amount of kcal for any given day. You will be provided with a list of recipes containing the kcal per serving, and the macronutrient content in grams for each recipe.",
        },
        {
            role: "user",
            content: "Here is a list of recipes I have some questions about. Do not respond until asked.",
        },
    ]);

    useEffect(() => {
        getRows(
            "recipes",
            `display_name,
            servings,
            recipes_ingredients (
                recipes_macronutrients (
                    kcal,
                    carbohydrate,
                    fat,
                    protein
                )
            )`
        )
            .then((res) => {
                console.log(res.flat());
                const message = {
                    role: "user",
                    content: JSON.stringify(
                        res.map((item) => {
                            return {
                                name: item.display_name,
                                servings: item.servings,
                                kcal: Math.round(item.recipes_ingredients.reduce((acc, item) => item.recipes_macronutrients.kcal + acc, 0)),
                                carbohydrate: Math.round(item.recipes_ingredients.reduce((acc, item) => item.recipes_macronutrients.carbohydrate + acc, 0)),
                                fat: Math.round(item.recipes_ingredients.reduce((acc, item) => item.recipes_macronutrients.fat + acc, 0)),
                                protein: Math.round(item.recipes_ingredients.reduce((acc, item) => item.recipes_macronutrients.protein + acc, 0)),
                            };
                        })
                    ),
                };
                setMessages((previous) => [...previous, message]);
            })
            .catch((error) => console.error(error));
    }, []);

    const askNutribot = async (query) => {
        setIsThinking(true);

        const url = "https://api.openai.com/v1/chat/completions";
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${import.meta.env.VITE_OPENAI_SECRET}`,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [...messages, { role: "user", content: query }],
                temperature: 0.2,
            }),
        };
        const req = fetch(url, options);

        req.then((res) => res.json())
            .then((data) => {
                const reply = {
                    role: data.choices[0].message.role,
                    content: data.choices[0].message.content,
                };

                setMessages((previous) => [...previous, reply]);
            })
            .finally(() => setIsThinking(false));
    };

    const submitHandler = (event) => {
        event.preventDefault();

        const { value } = event.target.query;

        if (!value) return;

        const question = {
            role: "user",
            content: value,
        };

        setMessages((previous) => [...previous, question]);
        askNutribot(question.content);
        event.target.query.value = "";
    };

    return (
        <form onSubmit={submitHandler}>
            <Stack>
                <label html="query">Ask Nutribot a question</label>
                <textarea id="query"></textarea>
                <button type="submit">Ask</button>
            </Stack>
            <Stack>
                <ul>
                    {messages.map((message, index) => {
                        if (index < 3) return null;

                        const { role, content } = message;

                        return <li key={index}>{content}</li>;
                    })}
                </ul>
            </Stack>
        </form>
    );
};

export default Nutribot;
