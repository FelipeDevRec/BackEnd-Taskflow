const supabase = require("./supabase");

const useSupabase = Boolean(supabase);

const handleSupabaseResponse = (result) => {
  if (result.error) {
    throw result.error;
  }
  return result.data;
};

const connect = async () => {
  if (useSupabase) return;
  throw new Error("No database client configured. Set SUPABASE_SECRET_KEY in .env.");
};

const disconnect = async () => {
  return;
};

const getUserByEmail = async (email) => {
  if (useSupabase) {
    const result = await supabase
      .from("users")
      .select("id,name,email,password,createdAt")
      .eq("email", email)
      .maybeSingle();
    return handleSupabaseResponse(result);
  }
  throw new Error('Supabase client not configured. Set SUPABASE_SECRET_KEY in .env.');
};

const getUserById = async (id) => {
  if (useSupabase) {
    const result = await supabase
      .from("users")
      .select("id,name,email,createdAt")
      .eq("id", id)
      .maybeSingle();
    return handleSupabaseResponse(result);
  }
  throw new Error('Supabase client not configured. Set SUPABASE_SECRET_KEY in .env.');
};

const createUser = async ({ name, email, password }) => {
  if (useSupabase) {
    const result = await supabase
      .from("users")
      .insert({ name, email, password })
      .select("id,name,email,createdAt")
      .single();
    return handleSupabaseResponse(result);
  }
  throw new Error('Supabase client not configured. Set SUPABASE_SECRET_KEY in .env.');
};

const getTasks = async (userId, status = "all") => {
  if (useSupabase) {
    const query = supabase
      .from("tasks")
      .select("id,title,completed,userId,createdAt,updatedAt")
      .eq("userId", userId)
      .order("createdAt", { ascending: false });

    if (status === "active") query.eq("completed", false);
    else if (status === "completed") query.eq("completed", true);

    const result = await query;
    return handleSupabaseResponse(result) || [];
  }
  throw new Error('Supabase client not configured. Set SUPABASE_SECRET_KEY in .env.');
};

const countTasks = async (userId, completed) => {
  if (useSupabase) {
    let query = supabase.from("tasks").select("id", { count: "exact", head: true }).eq("userId", userId);
    if (completed !== undefined) query = query.eq("completed", completed);
    const result = await query;
    handleSupabaseResponse(result);
    return result.count || 0;
  }
  throw new Error('Supabase client not configured. Set SUPABASE_SECRET_KEY in .env.');
};

const createTask = async (userId, title) => {
  if (useSupabase) {
    const result = await supabase
      .from("tasks")
      .insert({ title: title.trim(), userId })
      .select("id,title,completed,userId,createdAt,updatedAt")
      .single();
    return handleSupabaseResponse(result);
  }
  throw new Error('Supabase client not configured. Set SUPABASE_SECRET_KEY in .env.');
};

const findTaskByIdAndUser = async (id, userId) => {
  if (useSupabase) {
    const result = await supabase
      .from("tasks")
      .select("id,title,completed,userId,createdAt,updatedAt")
      .eq("id", id)
      .eq("userId", userId)
      .maybeSingle();
    return handleSupabaseResponse(result);
  }
  throw new Error('Supabase client not configured. Set SUPABASE_SECRET_KEY in .env.');
};

const updateTask = async (id, data) => {
  if (useSupabase) {
    const result = await supabase
      .from("tasks")
      .update(data)
      .eq("id", id)
      .select("id,title,completed,userId,createdAt,updatedAt")
      .single();
    return handleSupabaseResponse(result);
  }
  throw new Error('Supabase client not configured. Set SUPABASE_SECRET_KEY in .env.');
};

const deleteTask = async (id) => {
  if (useSupabase) {
    const result = await supabase.from("tasks").delete().eq("id", id).single();
    return handleSupabaseResponse(result);
  }
  throw new Error('Supabase client not configured. Set SUPABASE_SECRET_KEY in .env.');
};

const deleteAllTasks = async () => {
  if (useSupabase) {
    const result = await supabase.from("tasks").delete().neq("id", "");
    return handleSupabaseResponse(result);
  }
  throw new Error('Supabase client not configured. Set SUPABASE_SECRET_KEY in .env.');
};

const deleteAllUsers = async () => {
  if (useSupabase) {
    const result = await supabase.from("users").delete().neq("id", "");
    return handleSupabaseResponse(result);
  }
  throw new Error('Supabase client not configured. Set SUPABASE_SECRET_KEY in .env.');
};

module.exports = {
  useSupabase,
  connect,
  disconnect,
  getUserByEmail,
  getUserById,
  createUser,
  getTasks,
  countTasks,
  createTask,
  findTaskByIdAndUser,
  updateTask,
  deleteTask,
  deleteAllTasks,
  deleteAllUsers,
};
