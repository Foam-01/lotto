import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import config from "../config";

// ─── helpers ─────────────────────────────────────────────────────────────────

const NUM_DIGITS = 6;

function sanitize(val) {
  return val.replace(/[^0-9]/g, "").slice(0, 1);
}

function matchesQuery(numbers, digits) {
  const query = digits.filter(Boolean).join("");
  if (!query) return true;
  if (digits.every(Boolean)) return numbers === query;
  return numbers.startsWith(query) || numbers.includes(query);
}

function HighlightNumber({ numbers, digits }) {
  const query = digits.filter(Boolean).join("");
  if (!query) return <span style={styles.ticketRedNumber}>{numbers}</span>;

  const idx = numbers.indexOf(query);
  if (idx === -1) return <span style={styles.ticketRedNumber}>{numbers}</span>;

  return (
    <span style={styles.ticketRedNumber}>
      {numbers.slice(0, idx)}
      <span style={styles.matchHighlight}>
        {numbers.slice(idx, idx + query.length)}
      </span>
      {numbers.slice(idx + query.length)}
    </span>
  );
}

// ─── component ───────────────────────────────────────────────────────────────

function Index() {
  const [lottos, setLottos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [digits, setDigits] = useState(Array(NUM_DIGITS).fill(""));
  const [searchQuery, setSearchQuery] = useState("");
  const [cartFeedback, setCartFeedback] = useState({});

  const inputRefs = useRef([]);

  // ── fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchLottos();
  }, []);

  const fetchLottos = async () => {
    setLoading(true);
    try {
      const res = await axios.get(config.apiPath + "/api/lotto/list");
      setLottos(res.data.result ?? []);
    } catch (e) {
      console.error("Error fetching lottos:", e);
    } finally {
      setLoading(false);
    }
  };

  // ── digit input ──────────────────────────────────────────────────────────
  const handleDigitChange = (idx, raw) => {
    const val = sanitize(raw);
    setDigits((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
    if (val && idx < NUM_DIGITS - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      setDigits((prev) => {
        const next = [...prev];
        next[idx - 1] = "";
        return next;
      });
      inputRefs.current[idx - 1]?.focus();
    }
    if (e.key === "Enter") handleSearch();
  };

  const handleClear = () => {
    setDigits(Array(NUM_DIGITS).fill(""));
    setSearchQuery("");
    inputRefs.current[0]?.focus();
  };

  // ── search ────────────────────────────────────────────────────────────────
  const handleSearch = useCallback(() => {
    setSearchQuery(digits.filter(Boolean).join(""));
  }, [digits]);

  // ── cart feedback ─────────────────────────────────────────────────────────
  const handleAddCart = (id) => {
    setCartFeedback((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCartFeedback((prev) => ({ ...prev, [id]: false }));
    }, 1500);
  };

  // ── derived ───────────────────────────────────────────────────────────────
  const filledCount = digits.filter(Boolean).length;
  const partialQuery = digits.filter(Boolean).join("");
  const liveMatchCount = lottos.filter((l) =>
    matchesQuery(l.numbers, digits),
  ).length;

  const displayList = lottos.filter((l) =>
    matchesQuery(
      l.numbers,
      searchQuery
        ? searchQuery
            .split("")
            .concat(Array(NUM_DIGITS - searchQuery.length).fill(""))
        : digits,
    ),
  );

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      {/* 🌟 Background Decorations (ทำให้พื้นหลังไม่โล่ง) 🌟 */}
      <div style={styles.bgPattern}></div>
      <div style={styles.glowBlobTopRight}></div>
      <div style={styles.glowBlobBottomLeft}></div>

      <div style={{ ...styles.floatingIcon, top: "25%", left: "5%" }}>🐾</div>
      <div
        style={{
          ...styles.floatingIcon,
          top: "60%",
          right: "8%",
          fontSize: "70px",
          opacity: 0.05,
        }}
      >
        💰
      </div>
      <div
        style={{
          ...styles.floatingIcon,
          top: "80%",
          left: "10%",
          fontSize: "40px",
          transform: "rotate(15deg)",
        }}
      >
        ✨
      </div>
      <div
        style={{
          ...styles.floatingIcon,
          top: "35%",
          right: "12%",
          transform: "rotate(25deg)",
        }}
      >
        🐾
      </div>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div style={styles.heroSection}>
        <div style={styles.container}>
          <div style={styles.heroGrid}>
            {/* mascot */}
            <div style={styles.heroLeft}>
              <div style={styles.mascotArea}>
                <span style={styles.mascotEmoji}>🐈</span>
                <div>
                  <h1 style={styles.heroTitle}>แผงแมวส้ม</h1>
                  <p style={styles.heroSubtitle}>ตัวตึงเรื่องให้โชค!</p>
                </div>
              </div>
            </div>

            {/* search card */}
            <div style={styles.searchCard}>
              <div style={styles.searchBody}>
                <p style={styles.searchLabel}>กรอกตัวเลข ค้นหารางวัลที่ 1</p>

                <div style={styles.inputsRow}>
                  {digits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      id={`ball-${idx}`}
                      style={{
                        ...styles.digitBox,
                        ...(digit ? styles.digitBoxFilled : {}),
                      }}
                      maxLength="1"
                      inputMode="numeric"
                      pattern="[0-9]"
                      value={digit}
                      placeholder={(idx + 1).toString()}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      autoComplete="off"
                    />
                  ))}
                </div>

                {filledCount > 0 && (
                  <p style={styles.liveStatus}>
                    {filledCount < NUM_DIGITS
                      ? `กรอก ${filledCount}/${NUM_DIGITS} หลัก — พบสลากที่ตรง ${liveMatchCount} ใบ`
                      : `ค้นหาเลข ${partialQuery}`}
                  </p>
                )}

                <div style={styles.btnRow}>
                  <button style={styles.btnSearch} onClick={handleSearch}>
                    <i className="bi bi-search me-2"></i> ค้นหาสลาก
                  </button>
                </div>

                {filledCount > 0 && (
                  <div style={{ textAlign: "center", marginTop: "12px" }}>
                    <button style={styles.btnClear} onClick={handleClear}>
                      <i className="bi bi-arrow-counterclockwise me-1"></i>{" "}
                      ล้างข้อมูลและเริ่มใหม่
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TICKET GRID ──────────────────────────────────────────────────── */}
      <div style={styles.container}>
        <div style={{ position: "relative", zIndex: 2 }}>
          <h3 style={styles.sectionHeader}>
            <span style={styles.iconPaw}>🐾</span> สลากพร้อมขาย (
            <span style={styles.countBadge}>{displayList.length} ใบ</span>)
          </h3>

          {loading ? (
            <LoadingDots />
          ) : displayList.length > 0 ? (
            <div style={styles.gridContainer}>
              {displayList.map((item, index) => (
                <div key={item.id ?? index} style={styles.ticketCard}>
                  <div style={styles.ticketVisual}>
                    {/* ต้นขั้ว (Stub) */}
                    <div style={styles.ticketStub}>
                      <div style={styles.stubInner}>
                        <div style={styles.stubText}>เลขชุด</div>
                        <div style={styles.stubHighlight}>1 ใบ</div>
                        <div style={styles.stubBadge}>
                          <i className="bi bi-coin me-1"></i> 6 ล้าน
                        </div>
                      </div>
                    </div>

                    <div style={styles.perforatedLine}></div>

                    <div style={styles.ticketMain}>
                      <div style={styles.watermark}>🐈</div>
                      <div style={styles.ticketTop}>
                        <span style={styles.govText}>สลากกินแบ่งรัฐบาล</span>
                        <div style={styles.barcodePlaceholder}></div>
                      </div>
                      <HighlightNumber
                        numbers={item.numbers}
                        digits={
                          searchQuery
                            ? searchQuery
                                .split("")
                                .concat(
                                  Array(NUM_DIGITS - searchQuery.length).fill(
                                    "",
                                  ),
                                )
                            : digits
                        }
                      />
                      <div style={styles.ticketBottom}>
                        <div>งวดที่ {item.roundNumber}</div>
                        <div>เล่มที่ {item.bookNumber}</div>
                      </div>
                    </div>
                  </div>

                  <div style={styles.buyBar}>
                    <div style={styles.priceTag}>
                      ใบละ{" "}
                      <span style={styles.priceHighlight}>{item.sale}</span> ฿
                    </div>
                    <button
                      style={{
                        ...styles.btnCart,
                        ...(cartFeedback[item.id] ? styles.btnCartAdded : {}),
                      }}
                      onClick={() => handleAddCart(item.id)}
                    >
                      <i
                        className={`bi ${cartFeedback[item.id] ? "bi-check-lg" : "bi-cart2"} me-2`}
                      ></i>
                      {cartFeedback[item.id] ? "เพิ่มแล้ว!" : "หยิบใส่ตะกร้า"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              searched={!!searchQuery}
              query={searchQuery}
              onClear={handleClear}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── sub-components ───────────────────────────────────────────────────────────

function LoadingDots() {
  return (
    <div style={styles.loadingWrap}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{ ...styles.dot, animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

function EmptyState({ searched, query, onClear }) {
  return (
    <div
      style={{
        ...styles.emptyState,
        ...(searched ? styles.emptyStateSearched : {}),
      }}
    >
      <div style={{ fontSize: "70px" }}>{searched ? "😿" : "😿"}</div>
      {searched ? (
        <>
          <h4 style={{ color: "#dc2626", marginTop: "15px" }}>
            ไม่พบเลข "{query}"
          </h4>
          <p style={{ color: "#999", marginBottom: "16px" }}>
            ลองค้นหาเลขอื่น หรือดูสลากทั้งหมด
          </p>
          <button style={styles.btnClearLarge} onClick={onClear}>
            ล้างการค้นหา
          </button>
        </>
      ) : (
        <>
          <h4 style={{ color: "#ea580c", marginTop: "15px" }}>
            แผงแมวส้มว่างเปล่า
          </h4>
          <p style={{ color: "#f59e0b" }}>
            กำลังวิ่งไปคาบสลากมาเพิ่ม รอก่อนน้า...
          </p>
        </>
      )}
    </div>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────

const styles = {
  page: {
    backgroundColor: "#fffbeb", // พื้นหลังสีเหลือง/ส้มอ่อนๆ นวลตา
    minHeight: "100vh",
    paddingBottom: "80px",
    fontFamily: "'Kanit', sans-serif",
    position: "relative",
    overflowX: "hidden", // 🌟 ป้องกันแสงตกขอบจนเกิด Scroll แนวนอน 🌟
  },

  // 🌟 Background Decorations 🌟
  bgPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.6,
    backgroundImage:
      "radial-gradient(#fde68a 2px, transparent 2px), radial-gradient(#fde68a 2px, transparent 2px)",
    backgroundSize: "40px 40px",
    backgroundPosition: "0 0, 20px 20px",
    zIndex: 0,
    pointerEvents: "none",
  },
  glowBlobTopRight: {
    position: "absolute",
    top: "20%",
    right: "-10%",
    width: "600px",
    height: "600px",
    background:
      "radial-gradient(circle, rgba(249,115,22,0.08) 0%, rgba(255,255,255,0) 70%)",
    borderRadius: "50%",
    zIndex: 0,
    pointerEvents: "none",
  },
  glowBlobBottomLeft: {
    position: "absolute",
    bottom: "10%",
    left: "-10%",
    width: "700px",
    height: "700px",
    background:
      "radial-gradient(circle, rgba(250,204,21,0.08) 0%, rgba(255,255,255,0) 70%)",
    borderRadius: "50%",
    zIndex: 0,
    pointerEvents: "none",
  },
  floatingIcon: {
    position: "absolute",
    fontSize: "50px",
    color: "#f59e0b",
    opacity: 0.1, // จางๆ ไม่กวนสายตา
    zIndex: 0,
    pointerEvents: "none",
    transform: "rotate(-15deg)",
  },

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
    position: "relative",
    zIndex: 2,
  },

  // hero
  heroSection: {
    background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
    padding: "50px 0",
    borderRadius: "0 0 40px 40px",
    marginBottom: "50px",
    boxShadow: "0 15px 40px rgba(234, 88, 12, 0.2)",
    position: "relative",
    zIndex: 3,
  },
  heroGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1.5fr",
    gap: "40px",
    alignItems: "center",
  },
  heroLeft: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "24px",
    boxShadow: "0 10px 25px rgba(0,0,0,.1)",
  },
  mascotArea: { display: "flex", alignItems: "center", gap: "20px" },
  mascotEmoji: {
    fontSize: "90px",
    filter: "drop-shadow(2px 4px 6px rgba(0,0,0,.1))",
  },
  heroTitle: {
    color: "#ea580c",
    fontSize: "36px",
    fontWeight: "900",
    margin: "0 0 5px",
  },
  heroSubtitle: {
    color: "#64748b",
    fontSize: "16px",
    margin: 0,
    fontWeight: "500",
  },

  // search card
  searchCard: {
    backgroundColor: "#fff",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 20px 40px rgba(0,0,0,.1)",
  },
  searchBody: { padding: "35px" },
  searchLabel: {
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: "20px",
    fontSize: "20px",
    textAlign: "center",
  },

  inputsRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "20px",
    justifyContent: "center",
    flexWrap: "nowrap",
  },
  digitBox: {
    flex: "1 1 0px",
    minWidth: "0",
    height: "70px",
    fontSize: "36px",
    fontWeight: "900",
    textAlign: "center",
    color: "#cbd5e1",
    border: "2px solid #e2e8f0",
    borderRadius: "16px",
    outline: "none",
    backgroundColor: "#f8fafc",
    boxShadow: "inset 0 2px 4px rgba(0,0,0,.02)",
    fontFamily: "inherit",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    padding: "0",
  },
  digitBoxFilled: {
    borderColor: "#ea580c",
    backgroundColor: "#fff",
    color: "#ea580c",
    transform: "translateY(-3px)",
    boxShadow:
      "0 8px 20px rgba(234, 88, 12, 0.15), 0 0 0 3px rgba(234, 88, 12, 0.1)",
  },

  liveStatus: {
    fontSize: "14px",
    color: "#64748b",
    marginBottom: "20px",
    textAlign: "center",
    fontWeight: "500",
  },
  btnRow: { display: "flex", gap: "15px" },
  btnSearch: {
    flex: 1,
    backgroundColor: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "18px",
    borderRadius: "16px",
    fontSize: "20px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 6px 20px rgba(220, 38, 38, 0.3)",
    fontFamily: "inherit",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  btnClear: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "color 0.2s",
  },
  btnClearLarge: {
    backgroundColor: "#ea580c",
    color: "#fff",
    border: "none",
    padding: "12px 28px",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "16px",
    cursor: "pointer",
    fontFamily: "inherit",
  },

  // ticket grid
  sectionHeader: {
    fontSize: "26px",
    fontWeight: "900",
    color: "#431407", // น้ำตาลเข้ม
    marginBottom: "30px",
    borderLeft: "6px solid #ea580c",
    paddingLeft: "16px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  iconPaw: { color: "#ea580c" },
  countBadge: {
    backgroundColor: "#ea580c",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "700",
    padding: "4px 14px",
    borderRadius: "20px",
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))",
    gap: "30px",
  },

  // ticket card
  ticketCard: {
    backgroundColor: "#292524", // สีเทาเข้ม
    borderRadius: "20px",
    padding: "10px",
    boxShadow: "0 12px 30px rgba(0,0,0,.08)",
    display: "flex",
    flexDirection: "column",
    transition: "transform .2s, box-shadow .2s",
    border: "2px solid #fcd34d", // ขอบสีทองอ่อนๆ
  },
  ticketVisual: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    display: "flex",
    height: "150px",
    overflow: "hidden",
    position: "relative",
  },

  // 🌟 ต้นขั้ว (Stub) 🌟
  ticketStub: {
    width: "80px",
    backgroundColor: "#fef3c7",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "10px",
    borderRight: "2px dashed #f59e0b",
  },
  stubInner: {
    textAlign: "center",
    backgroundColor: "#fffbeb",
    padding: "10px 5px",
    borderRadius: "8px",
    border: "1px solid #fcd34d",
    width: "100%",
    boxShadow: "0 2px 5px rgba(245, 158, 11, 0.1)",
  },
  stubText: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#b45309",
  },
  stubHighlight: {
    fontSize: "22px",
    fontWeight: "900",
    color: "#ea580c",
    margin: "5px 0",
  },
  stubBadge: {
    backgroundColor: "#ea580c",
    color: "#fff",
    fontSize: "11px",
    fontWeight: "800",
    padding: "3px 6px",
    borderRadius: "4px",
    display: "inline-block",
    marginTop: "2px",
  },

  perforatedLine: {
    width: "4px",
    background:
      "repeating-linear-gradient(to bottom,transparent,transparent 4px,#fcd34d 4px,#fcd34d 8px)",
  },
  ticketMain: {
    flex: 1,
    padding: "15px 18px",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  watermark: {
    position: "absolute",
    fontSize: "90px",
    opacity: "0.06",
    top: "50%",
    left: "50%",
    transform: "translate(-50%,-50%)",
    pointerEvents: "none",
  },
  ticketTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    zIndex: 1,
  },
  govText: { fontSize: "12px", fontWeight: "800", color: "#ea580c" },
  barcodePlaceholder: {
    width: "60px",
    height: "15px",
    background:
      "repeating-linear-gradient(to right,#000,#000 2px,#fff 2px,#fff 4px)",
  },
  ticketRedNumber: {
    fontSize: "42px",
    fontWeight: "900",
    color: "#dc2626",
    letterSpacing: "6px",
    textAlign: "center",
    margin: "5px 0",
    zIndex: 1,
    display: "block",
  },
  matchHighlight: {
    color: "#16a34a",
    backgroundColor: "#dcfce7",
    borderRadius: "6px",
    padding: "0 4px",
  },
  ticketBottom: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "700",
    zIndex: 1,
  },

  // buy bar
  buyBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "14px",
    padding: "0 8px 5px",
  },
  priceTag: { color: "#fff", fontSize: "15px", fontWeight: "500" },
  priceHighlight: { color: "#fcd34d", fontSize: "26px", fontWeight: "900" },
  btnCart: {
    backgroundColor: "#ea580c",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "10px",
    fontWeight: "800",
    fontSize: "15px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(234, 88, 12, 0.3)",
    fontFamily: "inherit",
    transition: "background .2s",
  },
  btnCartAdded: {
    backgroundColor: "#16a34a",
    boxShadow: "0 4px 12px rgba(22,163,74,.4)",
  },

  // loading
  loadingWrap: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    padding: "60px",
  },
  dot: {
    width: "14px",
    height: "14px",
    backgroundColor: "#ea580c",
    borderRadius: "50%",
    animation: "bounce .8s infinite ease-in-out",
  },

  // empty state
  emptyState: {
    textAlign: "center",
    padding: "100px",
    backgroundColor: "#fff",
    borderRadius: "24px",
    border: "3px dashed #fdba74",
    boxShadow: "0 10px 25px rgba(245, 158, 11, 0.1)",
  },
  emptyStateSearched: {
    border: "3px dashed #fca5a5",
    backgroundColor: "#fef2f2",
    boxShadow: "none",
  },
};

export default Index;
