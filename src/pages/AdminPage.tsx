import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Papa from "papaparse";
import "./AdminCertificates.css"; // ✅ external CSS

// ✅ Strong typing for a certificate row
interface Certificate {
  id?: string;
  student_name: string;
  student_email: string;
  course_name: string;
  course_duration: string;
  completion_status: string;
  badge_url: string;
  serial_number: string;
  created_at?: string;
  [key: string]: any; // allows dynamic indexing like row[field]
}

export default function AdminCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [form, setForm] = useState<Certificate>({
    id: "",
    student_name: "",
    course_name: "",
    course_duration: "",
    student_email: "",
    completion_status: "Completed",
    badge_url: "",
    serial_number: "",
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  // ✅ Search + toggle
  const [search, setSearch] = useState("");
  const [showCertificates, setShowCertificates] = useState(false);

  // ✅ Built-in CSV-like editor
  const [tableRows, setTableRows] = useState<Certificate[]>([
    {
      student_name: "",
      student_email: "",
      course_name: "",
      course_duration: "",
      completion_status: "Completed",
      badge_url: "",
      serial_number: "",
    },
  ]);

  // ===============================
  // ✅ Fetch all certificates
  // ===============================
  const fetchCertificates = async () => {
    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setCertificates(data as Certificate[]);
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  // ✅ Convert Drive link -> direct download
  const convertDriveLink = (url: string) => {
    if (!url.includes("drive.google.com")) return url;
    const fileId = url.match(/[-\w]{25,}/)?.[0];
    return fileId
      ? `https://drive.google.com/uc?export=download&id=${fileId}`
      : url;
  };

  // ===============================
  // ✅ Create or Update certificate
  // ===============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleanedForm: Certificate = {
      student_name: form.student_name.trim(),
      course_name: form.course_name.trim(),
      course_duration: form.course_duration.trim(),
      student_email: form.student_email.trim(),
      completion_status: form.completion_status,
      badge_url: convertDriveLink(form.badge_url.trim()),
      serial_number: form.serial_number.trim(),
    };

    let error;
    if (editing && form.id) {
      ({ error } = await supabase
        .from("certificates")
        .update(cleanedForm)
        .eq("id", form.id));
    } else {
      ({ error } = await supabase.from("certificates").insert([cleanedForm]));
    }

    setLoading(false);

    if (error) {
      alert("❌ Error: " + error.message);
    } else {
      alert(editing ? "✏️ Certificate updated!" : "✅ Certificate created!");
      resetForm();
      fetchCertificates();
    }
  };

  // ✅ Delete certificate
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this certificate?")) return;
    const { error } = await supabase.from("certificates").delete().eq("id", id);
    if (error) {
      alert("❌ Error deleting: " + error.message);
    } else {
      alert("🗑️ Deleted successfully");
      fetchCertificates();
    }
  };

  // ✅ Edit certificate
  const handleEdit = (cert: Certificate) => {
    setForm(cert);
    setEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setForm({
      id: "",
      student_name: "",
      course_name: "",
      course_duration: "",
      student_email: "",
      completion_status: "Completed",
      badge_url: "",
      serial_number: "",
    });
    setEditing(false);
  };

  // ===============================
  // ✅ Bulk Upload via CSV (file)
  // ===============================
  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkLoading(true);

    Papa.parse<Certificate>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as Certificate[];

        const cleanedRows = rows.map((row) => ({
          student_name: row.student_name?.trim() || "",
          student_email: row.student_email?.trim() || "",
          course_name: row.course_name?.trim() || "",
          course_duration: row.course_duration?.trim() || "",
          completion_status: row.completion_status?.trim() || "Completed",
          badge_url: convertDriveLink(row.badge_url?.trim() || ""),
          serial_number: row.serial_number?.trim() || "",
        }));

        const { error } = await supabase
          .from("certificates")
          .insert(cleanedRows);

        setBulkLoading(false);

        if (error) {
          alert("❌ Bulk upload error: " + error.message);
        } else {
          alert(
            `✅ Bulk upload successful! Inserted ${cleanedRows.length} certificates`
          );
          fetchCertificates();
        }
      },
    });
  };

  // ✅ Download CSV Template
  const downloadTemplate = () => {
    const headers = [
      "student_name",
      "student_email",
      "course_name",
      "course_duration",
      "completion_status",
      "badge_url",
      "serial_number",
    ];
    const csvContent = [
      headers.join(","),
      "John Doe,john@example.com,React Basics,4 Weeks,Completed,https://drive.google.com/file/d/FILE_ID/view,ABC123",
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "certificates_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ✅ Built-in CSV Editor
  const handleRowChange = (index: number, field: string, value: string) => {
    const updated = [...tableRows];
    updated[index][field] = value;
    setTableRows(updated);
  };

  const addRow = () => {
    setTableRows([
      ...tableRows,
      {
        student_name: "",
        student_email: "",
        course_name: "",
        course_duration: "",
        completion_status: "Completed",
        badge_url: "",
        serial_number: "",
      },
    ]);
  };

  const saveTableRows = async () => {
    const cleaned = tableRows.map((row) => ({
      student_name: row.student_name.trim(),
      student_email: row.student_email.trim(),
      course_name: row.course_name.trim(),
      course_duration: row.course_duration.trim(),
      completion_status: row.completion_status.trim() || "Completed",
      badge_url: convertDriveLink(row.badge_url.trim()),
      serial_number: row.serial_number.trim(),
    }));

    const { error } = await supabase.from("certificates").insert(cleaned);
    if (error) {
      alert("❌ Error saving rows: " + error.message);
    } else {
      alert(`✅ Saved ${cleaned.length} certificates`);
      setTableRows([
        {
          student_name: "",
          student_email: "",
          course_name: "",
          course_duration: "",
          completion_status: "Completed",
          badge_url: "",
          serial_number: "",
        },
      ]);
      fetchCertificates();
    }
  };

  // ✅ Search Filter
  const filteredCertificates = certificates.filter(
    (c) =>
      c.student_name.toLowerCase().includes(search.toLowerCase()) ||
      c.course_name.toLowerCase().includes(search.toLowerCase()) ||
      c.serial_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-certificates">
      <h2>Admin – Certificates</h2>

      {/* Create / Edit Form */}
      <form onSubmit={handleSubmit} className="admin-form">
        <h3>{editing ? "Edit Certificate" : "Create New Certificate"}</h3>

        <div className="form-grid">
          <input
            type="text"
            placeholder="Student Name"
            value={form.student_name}
            onChange={(e) => setForm({ ...form, student_name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Student Email"
            value={form.student_email}
            onChange={(e) =>
              setForm({ ...form, student_email: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Course Name"
            value={form.course_name}
            onChange={(e) => setForm({ ...form, course_name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Course Duration"
            value={form.course_duration}
            onChange={(e) =>
              setForm({ ...form, course_duration: e.target.value })
            }
            required
          />
          <select
            value={form.completion_status}
            onChange={(e) =>
              setForm({ ...form, completion_status: e.target.value })
            }
          >
            <option>Completed</option>
            <option>In Progress</option>
            <option>Failed</option>
          </select>
          <input
            type="text"
            placeholder="Badge URL (Google Drive / direct link)"
            value={form.badge_url}
            onChange={(e) => setForm({ ...form, badge_url: e.target.value })}
          />
          <input
            type="text"
            placeholder="Serial Number"
            value={form.serial_number}
            onChange={(e) =>
              setForm({ ...form, serial_number: e.target.value })
            }
            required
          />
        </div>

        <div className="admin-buttons">
          <button type="submit" className="save" disabled={loading}>
            {loading
              ? "Saving..."
              : editing
              ? "Update Certificate"
              : "Create Certificate"}
          </button>
          {editing && (
            <button type="button" onClick={resetForm} className="add">
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Built-in CSV Editor */}
      <div className="admin-section">
        <h3>📝 Built-in CSV Editor</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Email</th>
              <th>Course</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Badge URL</th>
              <th>Serial</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, i) => (
              <tr key={i}>
                {Object.keys(row).map((field, j) => (
                  <td key={j}>
                    <input
                      type="text"
                      value={row[field]}
                      onChange={(e) =>
                        handleRowChange(i, field, e.target.value)
                      }
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="admin-buttons">
          <button onClick={addRow} className="add">
            + Add Row
          </button>
          <button onClick={saveTableRows} className="save">
            Save All
          </button>
        </div>
      </div>

      {/* Bulk Upload Section */}
      <div className="admin-section">
        <h3>📂 Bulk Upload Certificates</h3>
        <div className="admin-buttons">
          <button onClick={downloadTemplate} className="add">
            ⬇️ Download CSV Template
          </button>
        </div>
        <input type="file" accept=".csv" onChange={handleCSVUpload} />
        {bulkLoading && <p>⏳ Uploading...</p>}
      </div>

      {/* Search + View Toggle */}
      <div className="admin-section">
        <h3>Certificates</h3>
        <input
          type="text"
          placeholder="🔍 Search by name, course, or serial..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-bar"
        />
        <button
          className="view-btn"
          onClick={() => setShowCertificates(!showCertificates)}
        >
          {showCertificates ? "Hide Certificates" : "View Certificates"}
        </button>
      </div>

      {/* Certificates Table (only when clicked) */}
      {showCertificates && (
        <div className="admin-section">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Serial</th>
                <th>Email</th>
                <th>Status</th>
                <th>Badge</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCertificates.map((c) => (
                <tr key={c.id}>
                  <td>{c.student_name}</td>
                  <td>{c.course_name}</td>
                  <td>{c.serial_number}</td>
                  <td>{c.student_email}</td>
                  <td>{c.completion_status}</td>
                  <td>
                    {c.badge_url && (
                      <a
                        href={convertDriveLink(c.badge_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="download-link"
                      >
                        ⬇️ Download
                      </a>
                    )}
                  </td>
                  <td>
                    <button onClick={() => handleEdit(c)} className="add">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c.id!)}
                      className="delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {filteredCertificates.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center">
                    No certificates found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
