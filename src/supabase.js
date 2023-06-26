import { createClient } from "@supabase/supabase-js";

export const supabase = createClient("https://kdvwicccjdercqtrqemp.supabase.co", import.meta.env.VITE_SUPABASE_ANON);

export const signInWithEmail = async ({ email, password }) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
        if (error) {
            throw new Error(error.message);
        }
    } catch (error) {
        console.error("An error occurred during sign-in:", error);
        throw error;
    }
};

export const signOut = async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            throw new Error(error.message);
        }
    } catch (error) {
        console.error("An error occurred during sign-out:", error);
        throw error;
    }
};
export const getRows = async (table, columns = null) => {
    const { data, error } = await supabase.from(table).select(columns);
    return data ?? error;
};

export const insertRow = async (table, values) => {
    if (!values) return;
    console.log("Inserting: ", values);
    const { data, error } = await supabase.from(table).insert(values).select();
    return data ?? error;
};

export const updateRow = async (table, values) => {
    if (!values) return;
    const { data, error } = await supabase.from(table).update(values).eq("id", values.id).select();
    return data ?? error;
};

export const deleteRow = async (table, id) => {
    if (!id) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    return error;
};
