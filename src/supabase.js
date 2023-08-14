import { createClient } from "@supabase/supabase-js";

export const supabase = createClient("https://kdvwicccjdercqtrqemp.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkdndpY2NjamRlcmNxdHJxZW1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODY2NTM2OTgsImV4cCI6MjAwMjIyOTY5OH0.84JOOirsgjuY0T7x-KBzvOkNFGgWt7g8NcQN6OSyv6I");

export const signInWithEmail = async ({ email, password }, setError) => {
    try {
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
        if (error) {
            throw new Error(error.message);
        }
    } catch (error) {
        console.error("An error occurred during sign-in: ", error);
        setError(error.message);
    }
};

export const signOut = async (setError) => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            throw new Error(error.message);
        }
    } catch (error) {
        console.error("An error occurred during sign-out: ", error);
        setError(error.message);
    }
};

export const readRows = async (table, columns = "*") => {
    try {
        const { data, error } = await supabase.from(table).select(columns);
        if (error) {
            throw new Error(error.message);
        }
        return data;
    } catch (error) {
        console.error("An error occurred: ", error);
    }
};

export const insertRows = async (table, values) => {
    if (!values) return;
    try {
        const { data, error } = await supabase.from(table).insert(values).select();
        if (error) {
            throw new Error(error.message);
        }
        return data;
    } catch (error) {
        console.error("An error occurred: ", error);
    }
};

export const upsertRows = async (table, values, options = {}) => {
    if (!values) return;
    try {
        const { data, error } = await supabase.from(table).upsert(values, options).select();
        if (error) {
            throw new Error(error.message);
        }
        return data;
    } catch (error) {
        console.error("An error occurred: ", error);
    }
};

export const updateRows = async (table, values) => {
    if (!values) return;
    try {
        const { data, error } = await supabase.from(table).update(values).eq("id", values.id).select();
        if (error) {
            throw new Error(error.message);
        }
        return data;
    } catch (error) {
        console.error("An error occurred: ", error);
    }
};

export const deleteRows = async (table, id) => {
    if (!id) return;
    try {
        const { error } = await supabase.from(table).delete().eq("id", id);
        if (error) {
            throw new Error(error.message);
        }
    } catch (error) {
        console.error("An error occurred: ", error);
    }
};
