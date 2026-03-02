import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Newspaper, Plus, X, Loader2, CheckCircle2, XCircle, Clock, Link, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import { useLang } from "../LanguageContext";

const STATUS_CONFIG = {
  pending:    { label: "Checking...",   color: "#64748b", icon: Clock,         bg: "rgba(100,116,139,0.1)" },
  verified:   { label: "AI Verified",  color: "#10b981", icon: CheckCircle2,  bg: "rgba(16,185,129,0.1)"  },
  unverified: { label: "Unverified",   color: "#f59e0b", icon: XCircle,       bg: "rgba(245,158,11,0.1)"  },
  false:      { label: "False Info",   color: "#ef4444", icon: XCircle,       bg: "rgba(239,68,68,0.1)"   },
};

function SubmitForm({ onSubmit, onCancel, t }) {
  const [form, setForm] = useState({ headline: "", content: "", source_url: "", author_name: "", region: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.headline.trim() || !form.content.trim()) return;
    setSubmitting(true);
    await onSubmit(form);
    setSubmitting(false);
  };

  const field = (key, placeholder, multiline = false) => {
    const props = {
      placeholder,
      value: form[key],
      onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
      style: {
        width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 5, padding: "5px 8px", fontSize: 10, color: "#f1f5f9", outline: "none", resize: "none",
        fontFamily: "inherit",
      },
    };
    return multiline
      ? <textarea {...props} rows={3} />
      : <input {...props} />;
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, padding: 10, marginBottom: 8 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", marginBottom: 8, letterSpacing: "0.08em", textTransform: "uppercase" }}>{t.submitNewsReport}</div>
      <div className="space-y-2">
        {field("headline", t.headline)}
        {field("content", t.describeNews, true)}
        {field("source_url", t.sourceUrl)}
        {field("author_name", t.authorName)}
        {field("region", t.regionCountry)}
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        <button type="submit" disabled={submitting} style={{
          flex: 1, fontSize: 10, fontWeight: 600, color: "#fff",
          background: submitting ? "rgba(59,130,246,0.3)" : "rgba(59,130,246,0.7)",
          border: "1px solid rgba(59,130,246,0.4)", borderRadius: 4, padding: "5px 0", cursor: submitting ? "not-allowed" : "pointer"
        }}>
          {submitting ? t.submitting : t.submitVerify}
        </button>
        <button type="button" onClick={onCancel} style={{
          fontSize: 10, color: "#64748b", background: "transparent", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 4, padding: "5px 10px", cursor: "pointer"
        }}>{t.cancel}</button>
      </div>
    </form>
  );
}

function NewsCard({ post, t }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[post.verification_status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;

  return (
    <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid rgba(255,255,255,0.06)`, borderRadius: 6, padding: "8px 10px", marginBottom: 6 }}>
      {/* Status badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 5 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 3, background: cfg.bg, border: `1px solid ${cfg.color}33`, borderRadius: 4, padding: "2px 6px" }}>
          <Icon style={{ width: 9, height: 9, color: cfg.color }} />
          <span style={{ fontSize: 8, fontWeight: 700, color: cfg.color, letterSpacing: "0.08em", textTransform: "uppercase" }}>{cfg.label}</span>

          {post.verification_confidence != null && post.verification_status !== "pending" && (
            <span style={{ fontSize: 8, color: cfg.color, opacity: 0.7 }}>{Math.round(post.verification_confidence * 100)}%</span>
          )}
        </div>
        {post.region && <span style={{ fontSize: 8, color: "#475569", marginLeft: "auto" }}>📍 {post.region}</span>}
      </div>

      {/* Headline */}
      <div style={{ fontSize: 11, fontWeight: 600, color: "#e2e8f0", lineHeight: 1.4, marginBottom: 4 }}>{post.headline}</div>

      {/* Content preview */}
      <p style={{ fontSize: 10, color: "#64748b", lineHeight: 1.5, marginBottom: 4 }}>
        {expanded ? post.content : post.content?.slice(0, 100) + (post.content?.length > 100 ? "…" : "")}
      </p>

      {/* AI verification summary */}
      {post.verification_summary && post.verification_status !== "pending" && (
        <div style={{ background: "rgba(255,255,255,0.02)", borderLeft: `2px solid ${cfg.color}55`, padding: "4px 8px", marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 2 }}>
            <ShieldCheck style={{ width: 8, height: 8, color: cfg.color }} />
            <span style={{ fontSize: 8, fontWeight: 700, color: cfg.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>AI Fact-Check</span>
          </div>
          <p style={{ fontSize: 9, color: "#94a3b8", lineHeight: 1.4 }}>{post.verification_summary}</p>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
        {post.content?.length > 100 && (
          <button onClick={() => setExpanded((v) => !v)} style={{ fontSize: 9, color: "#3b82f6", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
        {post.source_url && (
          <a href={post.source_url} target="_blank" rel="noreferrer" style={{ fontSize: 9, color: "#475569", display: "flex", alignItems: "center", gap: 2, marginLeft: "auto" }}>
            <Link style={{ width: 8, height: 8 }} /> Source
          </a>
        )}
        <span style={{ fontSize: 8, color: "#334155", marginLeft: post.source_url ? 0 : "auto" }}>
          {post.author_name || "Anonymous"} · {post.created_date ? new Date(post.created_date).toLocaleDateString() : ""}
        </span>
      </div>
    </div>
  );
}

export default function NewsFeedPanel() {
  const [posts, setPosts] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadPosts = async () => {
    const data = await base44.entities.NewsPost.list("-created_date", 20);
    setPosts(data);
  };

  useEffect(() => {
    if (!expanded) return;
    setLoading(true);
    loadPosts().finally(() => setLoading(false));

    // Auto-refresh every 10 minutes
    const interval = setInterval(() => loadPosts(), 10 * 60 * 1000);

    const unsub = base44.entities.NewsPost.subscribe((ev) => {
      if (ev.type === "create") setPosts((p) => [ev.data, ...p]);
      else if (ev.type === "update") setPosts((p) => p.map((x) => x.id === ev.id ? ev.data : x));
      else if (ev.type === "delete") setPosts((p) => p.filter((x) => x.id !== ev.id));
    });

    return () => {
      clearInterval(interval);
      unsub();
    };
  }, [expanded]);

  const handleSubmit = async (form) => {
    // Create post with pending status
    const post = await base44.entities.NewsPost.create({
      ...form,
      verification_status: "pending",
    });

    setShowForm(false);

    // AI fact-check
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an AI fact-checker for a conflict intelligence platform. A user submitted this news report:\n\nHeadline: ${form.headline}\nContent: ${form.content}\nSource URL: ${form.source_url || "none provided"}\n\nUsing your knowledge and reasoning, assess whether this news report is likely accurate, misleading, or false. Consider:\n- Is the event plausible given world context?\n- Are there obvious factual errors or implausible claims?\n- Does the content match the headline?\n\nProvide a factual verdict and brief explanation.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          status: { type: "string", description: "One of: verified, unverified, false" },
          confidence: { type: "number", description: "0.0 to 1.0 confidence score" },
          summary: { type: "string", description: "2-3 sentence explanation of the verdict" },
        },
      },
    });

    const status = ["verified", "unverified", "false"].includes(result.status) ? result.status : "unverified";

    await base44.entities.NewsPost.update(post.id, {
      verification_status: status,
      verification_confidence: result.confidence ?? null,
      verification_summary: result.summary ?? null,
    });
  };

  const pendingCount = posts.filter((p) => p.verification_status === "pending").length;

  return (
    <div className="border-b border-white/[0.05]">
      <div
        className="flex items-center gap-2 p-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <Newspaper className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-[11px] font-bold tracking-widest text-slate-300 uppercase">News Feed</span>
        {pendingCount > 0 && (
          <span style={{ fontSize: 8, background: "rgba(245,158,11,0.2)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 3, padding: "1px 5px", fontWeight: 700 }}>
            {pendingCount} checking
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          {expanded && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowForm((v) => !v); }}
              className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              <Plus className="w-2.5 h-2.5" />
              Submit
            </button>
          )}
          {expanded ? <ChevronUp className="w-3 h-3 text-slate-500" /> : <ChevronDown className="w-3 h-3 text-slate-500" />}
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3">
          {showForm && <SubmitForm onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />}

          {loading ? (
            <div className="flex items-center gap-2 py-3">
              <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
              <span style={{ fontSize: 10, color: "#475569" }}>Loading news...</span>
            </div>
          ) : posts.length === 0 ? (
            <p style={{ fontSize: 10, color: "#334155", paddingTop: 4 }}>No news submitted yet. Be the first!</p>
          ) : (
            <div style={{ maxHeight: 340, overflowY: "auto" }}>
              {posts.map((p) => <NewsCard key={p.id} post={p} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}