import React, { useEffect, useState } from "react";
import axios from "axios";
import config from "../../config/config";
import AdminSidebar from "../../components/admin/AdminSidebar";

const preferenceLabels = {
  all: "All Updates",
  promotions: "Promotions Only",
  events: "Events Only",
};

const AdminNewsletter = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState("");
  const [singleSend, setSingleSend] = useState(null);

  const API = config.API_URL;

  useEffect(() => {
    const fetchSubscribers = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API}/api/newsletter/subscribers`);
        setSubscribers(Array.isArray(data) ? data : []);
      } catch {
        setSubscribers([]);
      }
      setLoading(false);
    };
    fetchSubscribers();
  }, [API]);

  useEffect(() => {
    // Fetch templates for newsletter type
    axios.get(`${API}/api/email-templates/type/newsletter`).then(res => setTemplates(Array.isArray(res.data) ? res.data : []));
  }, [API]);

  const filtered = filter
    ? (Array.isArray(subscribers) ? subscribers : []).filter((s) => s.preferences.includes(filter))
    : (Array.isArray(subscribers) ? subscribers : []);

  useEffect(() => {
    if (selectAll) {
      setSelected(filtered.map((s) => s._id));
    } else {
      setSelected([]);
    }
    // eslint-disable-next-line
  }, [selectAll, filter, subscribers]);

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSendEmail = () => {
    setShowSendModal(true);
  };

  const handleSingleSend = (userId) => {
    setSelected([userId]);
    setShowSendModal(true);
    setSingleSend(userId);
  };

  const handleTemplateChange = (e) => {
    setSelectedTemplate(e.target.value);
    const tpl = templates.find(t => t._id === e.target.value);
    setPreviewHtml(tpl ? tpl.html : "");
  };

  const handleSendBulk = async () => {
    setSending(true);
    setSendResult("");
    try {
      await axios.post(`${API}/api/newsletter/bulk-send`, {
        userIds: selected,
        templateId: selectedTemplate,
      });
      setSendResult("Emails sent successfully!");
    } catch (err) {
      setSendResult("Failed to send emails.");
    }
    setSending(false);
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-6 max-w-5xl">
        <h1 className="text-2xl font-bold mb-4">Newsletter Subscribers</h1>
        <div className="mb-4 flex gap-2 items-center">
          <span>Filter by preference:</span>
          <select
            className="border rounded px-2 py-1"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="all">All Updates</option>
            <option value="promotions">Promotions Only</option>
            <option value="events">Events Only</option>
          </select>
          <button
            className="ml-auto bg-lime-500 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={selected.length === 0}
            onClick={handleSendEmail}
          >
            Send Email
          </button>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table className="w-full border mt-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={() => setSelectAll((v) => !v)}
                  />
                </th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Preferences</th>
                <th className="p-2 border">Subscribed At</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {(!Array.isArray(filtered) || filtered.length === 0) ? (
                <tr>
                  <td colSpan={5} className="text-center p-4">No subscribers found.</td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s._id}>
                    <td className="border p-2 text-center">
                      <input
                        type="checkbox"
                        checked={selected.includes(s._id)}
                        onChange={() => handleSelect(s._id)}
                      />
                    </td>
                    <td className="border p-2">{s.email}</td>
                    <td className="border p-2">
                      {s.preferences.map((p) => preferenceLabels[p] || p).join(", ")}
                    </td>
                    <td className="border p-2">{new Date(s.createdAt).toLocaleString()}</td>
                    <td className="border p-2 text-center">
                      <button
                        className="px-3 py-1 bg-lime-500 text-white rounded"
                        onClick={() => handleSingleSend(s._id)}
                      >
                        Send Mail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
        {showSendModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
              <h2 className="text-lg font-bold mb-4">Send Email to Selected Subscribers</h2>
              <div className="mb-4">
                <label className="block mb-1">Select Template</label>
                <select
                  className="border rounded px-2 py-1 w-full"
                  value={selectedTemplate}
                  onChange={handleTemplateChange}
                >
                  <option value="">-- Select --</option>
                  {Array.isArray(templates) ? templates.map((tpl) => (
                    <option key={tpl._id} value={tpl._id}>{tpl.name}</option>
                  )) : null}
                </select>
              </div>
              {previewHtml && (
                <div
                  className="mb-4 border rounded bg-gray-50"
                  style={{
                    maxWidth: '100vw',
                    maxHeight: '50vh',
                    overflowX: 'auto',
                    overflowY: 'auto',
                    padding: 12,
                    boxSizing: 'border-box',
                  }}
                >
                  <div className="font-semibold mb-1">Preview:</div>
                  <div
                    style={{ wordBreak: 'break-word', whiteSpace: 'pre-line', width: '100%' }}
                    className="text-sm md:text-base"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                </div>
              )}
              {sendResult && <div className="mb-2 text-green-600">{sendResult}</div>}
              <div className="flex gap-2 justify-end">
                <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setShowSendModal(false)} disabled={sending}>
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-lime-500 text-white rounded disabled:opacity-50"
                  disabled={!selectedTemplate || sending}
                  onClick={handleSendBulk}
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNewsletter; 