import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/siruvai/users";

const UsersManager = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    username: "",
    password_hash: "",
    full_name: "",
    role: "sales", // default
    is_active: true, // default
  });
  const [editingUserId, setEditingUserId] = useState(null);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await axios.get(API_URL);
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Add or edit user
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      // Remove is_active if not set (optional)
      if (payload.is_active === undefined) delete payload.is_active;

      if (editingUserId) {
        await axios.put(`${API_URL}/${editingUserId}`, payload);
        setEditingUserId(null);
      } else {
        await axios.post(API_URL, payload);
      }

      setFormData({
        username: "",
        password_hash: "",
        full_name: "",
        role: "sales",
        is_active: true,
      });

      fetchUsers();
    } catch (err) {
      console.error("Failed to save user:", err.response?.data || err.message);
      alert("Error: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  const handleEdit = (user) => {
    setEditingUserId(user.user_id);
    setFormData({
      username: user.username,
      password_hash: "", // empty for security
      full_name: user.full_name,
      role: user.role,
      is_active: user.is_active,
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Users Manager</h1>

      <form
        onSubmit={handleSubmit}
        className="mb-6 p-4 border rounded shadow space-y-2"
      >
        <h2 className="text-xl font-semibold">
          {editingUserId ? "Edit User" : "Add User"}
        </h2>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
          className="border p-2 w-full"
        />
        <input
          type="password"
          name="password_hash"
          placeholder="Password"
          value={formData.password_hash}
          onChange={handleChange}
          required={!editingUserId} // password optional when editing
          className="border p-2 w-full"
        />
        <input
          type="text"
          name="full_name"
          placeholder="Full Name"
          value={formData.full_name}
          onChange={handleChange}
          className="border p-2 w-full"
        />
        {/* Role dropdown */}
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        >
          <option value="admin">Admin</option>
          <option value="sales">Sales</option>
        </select>
        {/* Optional Active checkbox */}
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
          />
          <span>Active</span>
        </label>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {editingUserId ? "Update" : "Add"}
        </button>
      </form>

      <table className="table-auto w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">ID</th>
            <th className="border p-2">Username</th>
            <th className="border p-2">Full Name</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Active</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.user_id}>
              <td className="border p-2">{user.user_id}</td>
              <td className="border p-2">{user.username}</td>
              <td className="border p-2">{user.full_name}</td>
              <td className="border p-2">{user.role}</td>
              <td className="border p-2">{user.is_active ? "Yes" : "No"}</td>
              <td className="border p-2 space-x-2">
                <button
                  onClick={() => handleEdit(user)}
                  className="bg-yellow-400 px-2 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(user.user_id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersManager;
