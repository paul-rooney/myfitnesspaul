import db from "../../firebase-config";
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from "firebase/firestore";

export const readIngredients = async () => {
    const ingredientsCollection = collection(db, "ingredients");
    const ingredientsSnapshot = await getDocs(ingredientsCollection);
    const ingredients = ingredientsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return ingredients;
};

export const readIngredient = async (id) => {
    const reference = doc(db, "ingredients", id);
    const snapshot = await getDoc(reference);
    const ingredient = { id: snapshot.id, ...snapshot.data() };

    const ingredients = JSON.parse(localStorage.getItem("ingredients"));
    const index = ingredients.findIndex((item) => item.id === id);

    ingredients.splice(index, 1, ingredient);
    localStorage.setItem("ingredients", JSON.stringify(ingredients));
};

export const createUpdateIngredient = async (id, ingredient, merge = true, callback) => {
    const reference = doc(db, "ingredients", id);

    setDoc(reference, { ...ingredient }, { merge: merge }).catch((error) => console.error(error));
};

export const deleteIngredient = async (id, callback) => {
    console.log(id);
    const reference = doc(db, "ingredients", id);

    deleteDoc(reference).catch((error) => console.error(error));
};