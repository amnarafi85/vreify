import { useState } from "react";
import { supabase } from "../supabaseClient";
import "./CertificateVerify.css";
import logo192 from "./logo192.png";
export default function CertificateVerify() {
  const [serial, setSerial] = useState("");
  const [certificate, setCertificate] = useState<any>(null);
  const [error, setError] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setCertificate(null);

    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .eq("serial_number", serial)
      .single();

    if (error || !data) {
      setError("❌ No certificate found for this serial number.");
    } else {
      setCertificate(data);
    }
  };

  const getDownloadLink = (url: string) => {
    if (url.includes("drive.google.com")) {
      const fileId = url.match(/[-\w]{25,}/)?.[0];
      return fileId
        ? `https://drive.google.com/uc?export=download&id=${fileId}`
        : url;
    }
    return url;
  };

  return (
    <div className="certificate-page">
      <h2 className="verify-heading">🎓 Certificate Verification Portal</h2>

      <form onSubmit={handleVerify} className="verify-form">
        <input
          type="text"
          placeholder="Enter Serial Number"
          value={serial}
          onChange={(e) => setSerial(e.target.value)}
          className="verify-input"
        />
        <button className="verify-btn">Verify</button>
      </form>

      {error && <p className="error-msg">{error}</p>}

      {certificate && (
        <div className="certificate-card">
          {/* Top header with logo + Verified text */}
          <div className="certificate-header">
            {/* ✅ Place logo in public/logo.png */}
           <img src={logo192} alt="Logo" className="certificate-logo" /> 
            <h1 className="verified-text">✅ Verified Certificate</h1>
          </div>

          <div className="certificate-body">
            <p className="cert-text">This is to certify that</p>

            <h2 className="student-name">{certificate.student_name}</h2>

            <p className="cert-text">has successfully completed the course</p>

            <h3 className="course-name">{certificate.course_name}</h3>

            <p className="cert-text">Duration: {certificate.course_duration}</p>
          </div>

          <div className="certificate-footer">
            <p>
              <strong>Serial No:</strong> {certificate.serial_number}
            </p>
            <p>
              <strong>Status:</strong> {certificate.completion_status}
            </p>
          </div>

          {certificate.badge_url && (
            <div className="download-btn-container">
              <a
                href={getDownloadLink(certificate.badge_url)}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="download-btn"
              >
                ⬇️ Download Badge
              </a>
            </div>
          )}
        </div>
      )}

      {/* ✅ Global Footer always at bottom */}
      <footer className="global-footer">
        Awareness Paradigm Verification © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
