import React, { useEffect, useState } from "react";
import axios from "axios";
import config from "../../config/config";
import AdminSidebar from "../../components/admin/AdminSidebar";

const typeLabels = {
  newsletter: "Newsletter",
};

const emptyTemplate = {
  name: "",
  type: "newsletter",
  subject: "",
  html: "",
  isDefault: false,
};

const AdminEmailTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // id or 'new'
  const [form, setForm] = useState(emptyTemplate);
  const [error, setError] = useState("");

  const API = config.API_URL;

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/email-templates`);
      setTemplates(Array.isArray(data) ? data : []);
    } catch {
      setTemplates([]);
    }
    setLoading(false);
  };

  const startEdit = (tpl) => {
    setEditing(tpl._id);
    setForm({ ...tpl });
    setError("");
  };
  const startNew = () => {
    setEditing("new");
    setForm({ ...emptyTemplate });
    setError("");
  };
  const cancelEdit = () => {
    setEditing(null);
    setForm(emptyTemplate);
    setError("");
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };
  const saveTemplate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editing === "new") {
        await axios.post(`${API}/api/email-templates`, form);
      } else {
        await axios.put(`${API}/api/email-templates/${editing}`, form);
      }
      await fetchTemplates();
      cancelEdit();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save template");
    }
  };
  const deleteTemplate = async (id) => {
    if (!window.confirm("Delete this template?")) return;
    await axios.delete(`${API}/api/email-templates/${id}`);
    await fetchTemplates();
  };
  const setDefault = async (id) => {
    await axios.patch(`${API}/api/email-templates/${id}/default`);
    await fetchTemplates();
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-6 max-w-5xl">
        <h1 className="text-2xl font-bold mb-4">Email Templates</h1>
        <button className="mb-4 px-4 py-2 bg-lime-500 text-white rounded" onClick={startNew}>
          New Template
        </button>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table className="w-full border mb-8">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Type</th>
                <th className="p-2 border">Subject</th>
                <th className="p-2 border">Default</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(!Array.isArray(templates) || templates.length === 0) ? (
                <tr>
                  <td colSpan={5} className="text-center p-4">No templates found.</td>
                </tr>
              ) : (
                templates.map((tpl) => (
                  <tr key={tpl._id}>
                    <td className="border p-2">{tpl.name}</td>
                    <td className="border p-2">{typeLabels[tpl.type] || tpl.type}</td>
                    <td className="border p-2">{tpl.subject}</td>
                    <td className="border p-2">{tpl.isDefault ? "Yes" : ""}</td>
                    <td className="border p-2 flex gap-2">
                      <button className="px-2 py-1 bg-blue-500 text-white rounded" onClick={() => startEdit(tpl)}>
                        Edit
                      </button>
                      <button className="px-2 py-1 bg-red-500 text-white rounded" onClick={() => deleteTemplate(tpl._id)}>
                        Delete
                      </button>
                      {!tpl.isDefault && (
                        <button className="px-2 py-1 bg-gray-300 rounded" onClick={() => setDefault(tpl._id)}>
                          Set Default
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
        {(editing || editing === "new") && (
          <form className="bg-white p-6 rounded shadow-lg max-w-lg" onSubmit={saveTemplate}>
            <h2 className="text-lg font-bold mb-4">{editing === "new" ? "New" : "Edit"} Template</h2>
            {error && <div className="text-red-500 mb-2">{error}</div>}
            <div className="mb-2">
              <label className="block mb-1">Name</label>
              <input name="name" value={form.name} onChange={handleChange} className="border rounded px-2 py-1 w-full" required />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Type</label>
              <select name="type" value={form.type} onChange={handleChange} className="border rounded px-2 py-1 w-full">
              
             
                <option value="newsletter">Newsletter</option>
                
              </select>
            </div>
            <div className="mb-2">
              <label className="block mb-1">Subject</label>
              <input name="subject" value={form.subject} onChange={handleChange} className="border rounded px-2 py-1 w-full" required />
            </div>
            <div className="mb-2">
              <label className="block mb-1">HTML Content</label>
              <textarea name="html" value={form.html} onChange={handleChange} className="border rounded px-2 py-1 w-full" rows={8} required />
            </div>
            <div className="mb-2">
              <label className="inline-flex items-center">
                <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={handleChange} className="mr-2" />
                Set as default for this type
              </label>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="px-4 py-2 bg-lime-500 text-white rounded">Save</button>
              <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={cancelEdit}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminEmailTemplates; 