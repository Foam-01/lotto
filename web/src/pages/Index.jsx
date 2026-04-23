import axios from "axios";
import { useEffect, useRef, useState } from "react";
import config from "../config";
import Swal from "sweetalert2";
import "./Index.css";

// ─── helpers ─────────────────────────────────────────────────────────────────

const NUM_DIGITS = 6;

function sanitize(val) {
  return val.replace(/[^0-9]/g, "").slice(0, 1);
}

function HighlightNumber({ numbers, digits }) {
  if (!digits || digits.every((d) => d === "")) {
    return <span className="ticket-red-number">{numbers}</span>;
  }

  return (
    <span className="ticket-red-number">
      {numbers.split("").map((char, index) => {
        const isMatch = digits[index] !== "" && digits[index] === char;
        return (
          <span key={index} className={isMatch ? "match-highlight" : ""}>
            {char}
          </span>
        );
      })}
    </span>
  );
}

// ─── component ───────────────────────────────────────────────────────────────

function Index() {
  const [lottos, setLottos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [digits, setDigits] = useState(Array(NUM_DIGITS).fill(""));
  const [searchedDigits, setSearchedDigits] = useState(
    Array(NUM_DIGITS).fill(""),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [cartFeedback, setCartFeedback] = useState({});
  const [carts, setCarts] = useState([]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false); 

  const inputRefs = useRef([]);

  useEffect(() => {
    fetchLottos();
  }, []);

  const fetchLottos = async () => {
    setLoading(true);
    setSearchQuery("");
    setSearchedDigits(Array(NUM_DIGITS).fill(""));
    try {
      const res = await axios.get(config.apiPath + "/api/lotto/list");
      setLottos(res.data.result ?? []);
    } catch (e) {
      console.error("Error fetching lottos:", e);
    } finally {
      setLoading(false);
    }
  };

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
    if (e.key === "Enter") handleSearchStartEnd();
  };

  const handleClear = () => {
    setDigits(Array(NUM_DIGITS).fill(""));
    setSearchedDigits(Array(NUM_DIGITS).fill(""));
    inputRefs.current[0]?.focus();
    fetchLottos();
  };

  const handleSearchStartEnd = async () => {
    const isAnyFilled = digits.some((d) => d !== "");
    setSearchQuery(digits.join(""));
    setSearchedDigits([...digits]);

    if (!isAnyFilled) {
      fetchLottos();
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(config.apiPath + "/api/lotto/list");
      const allLottos = res.data.result ?? [];

      const exactMatches = allLottos.filter((lotto) => {
        for (let i = 0; i < 6; i++) {
          if (digits[i] !== "" && lotto.numbers[i] !== digits[i]) {
            return false;
          }
        }
        return true;
      });

      setLottos(exactMatches);
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถค้นหาสลากได้ กรุณาลองใหม่อีกครั้ง",
        confirmButtonColor: "#ea580c",
      });
      setLottos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    setCarts([...carts, { item: item }]);
    setCartFeedback((prev) => ({ ...prev, [item.id]: true }));
    setIsCartOpen(true);
    setTimeout(() => {
      setCartFeedback((prev) => ({ ...prev, [item.id]: false }));
    }, 1500);
  };

  const handleRemoveFromCart = (indexToRemove) => {
    const newCarts = carts.filter((_, idx) => idx !== indexToRemove);
    setCarts(newCarts);
    if (newCarts.length === 0) {
      setIsCartOpen(false);
    }
  };

  const filledCount = digits.filter(Boolean).length;

  return (
    <div className="page">
      <div className="sunburst-bg"></div>
      <div className="bg-pattern"></div>

      {/* 🌟 Top Navigation: ตะกร้าสินค้า 🌟 */}
      <div className="top-nav">
        <div className="cart-wrapper">
          <span className="cart-label">ตะกร้าสินค้า:</span>

          <button
            className="btn-cart-header"
            onClick={() => setIsCartOpen(!isCartOpen)}
          >
            <i className="bi bi-cart3"></i>
            <span className="cart-count">{carts.length}</span>
          </button>

          {isCartOpen && carts.length > 0 && (
            <div className="cart-dropdown">
              <div className="cart-dropdown-header">
                <h4>
                  <i className="bi bi-bag-check-fill me-2"></i>
                  รายการสลากที่เลือก
                </h4>
                <span className="count-badge">{carts.length} ใบ</span>
              </div>

              <div className="cart-items-container">
                {carts.map((cartItem, idx) => (
                  <div key={idx} className="cart-item">
                    <div className="cart-item-number">
                      {cartItem.item.numbers}
                    </div>

                    <div className="cart-item-right">
                      <div className="cart-item-price">
                        {cartItem.item.sale} ฿
                      </div>
                      <button
                        className="btn-remove-cart"
                        onClick={() => handleRemoveFromCart(idx)}
                        title="ลบสลากใบนี้"
                      >
                        <i className="bi bi-trash3-fill"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-dropdown-footer">
                <div className="cart-total">
                  <span className="cart-total-label">รวมยอดชำระ:</span>
                  <span className="cart-total-price">
                    {carts.reduce(
                      (total, current) => total + current.item.sale,
                      0,
                    )}{" "}
                    ฿
                  </span>
                </div>
                <button
                  className="btn-checkout"
                  onClick={() => {
                    setIsCartOpen(false); // ปิดหน้าต่างตะกร้า
                    setShowPaymentModal(true); // เปิด Modal ชำระเงิน
                  }}
                >
                  ไปหน้าชำระเงิน{" "}
                  <i className="bi bi-arrow-right-circle ms-1"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className="floating-icon"
        style={{
          top: "15%",
          left: "5%",
          fontSize: "80px",
          animationDelay: "0s",
        }}
      >
        💰
      </div>
      <div
        className="floating-icon"
        style={{
          top: "45%",
          right: "6%",
          fontSize: "100px",
          animationDelay: "1s",
        }}
      >
        🐾
      </div>
      <div
        className="floating-icon"
        style={{
          top: "75%",
          left: "8%",
          fontSize: "60px",
          animationDelay: "2s",
        }}
      >
        ✨
      </div>
      <div
        className="floating-icon"
        style={{
          top: "85%",
          right: "12%",
          fontSize: "70px",
          animationDelay: "0.5s",
        }}
      >
        🍀
      </div>
      <div
        className="floating-icon"
        style={{
          top: "30%",
          left: "20%",
          fontSize: "50px",
          animationDelay: "1.5s",
        }}
      >
        💰
      </div>
      <div
        className="floating-icon"
        style={{
          top: "60%",
          right: "25%",
          fontSize: "40px",
          animationDelay: "2.5s",
        }}
      >
        🐾
      </div>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className="hero-section">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-left">
              <div className="mascot-area">
                <span className="mascot-emoji">🐈</span>
                <div>
                  <h1 className="hero-title">แผงแมวส้ม</h1>
                  <p className="hero-subtitle">ตัวตึงเรื่องให้โชค!</p>
                </div>
              </div>
            </div>

            <div className="search-card">
              <div className="search-body">
                <p className="search-label">กรอกตัวเลข ค้นหารางวัลที่ 1</p>

                <div className="inputs-row">
                  {digits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      id={`ball-${idx}`}
                      className={`digit-box ${digit ? "filled" : ""}`}
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
                  <p className="live-status">
                    กำลังระบุตัวเลข... กดปุ่มค้นหาเพื่อดูผลลัพธ์
                  </p>
                )}

                <div className="btn-row">
                  <button className="btn-search" onClick={handleSearchStartEnd}>
                    <i className="bi bi-search me-2"></i> ค้นหาสลาก
                  </button>
                </div>

                {filledCount > 0 && (
                  <div style={{ textAlign: "center", marginTop: "12px" }}>
                    <button className="btn-clear" onClick={handleClear}>
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
      <div className="container">
        <div style={{ position: "relative", zIndex: 2 }}>
          <h3 className="section-header">
            <span className="icon-paw">🐾</span> สลากพร้อมขาย (
            <span className="count-badge">{lottos.length} ใบ</span>)
          </h3>

          {loading ? (
            <LoadingDots />
          ) : lottos.length > 0 ? (
            <div className="grid-container">
              {lottos.map((item, index) => (
                <div key={item.id ?? index} className="ticket-card">
                  <div className="ticket-visual">
                    <div className="ticket-stub">
                      <div className="stub-inner">
                        <div className="stub-text">เลขชุด</div>
                        <div className="stub-highlight">1 ใบ</div>
                        <div className="stub-badge">
                          <i className="bi bi-coin me-1"></i> 6 ล้าน
                        </div>
                      </div>
                    </div>

                    <div className="perforated-line"></div>

                    <div className="ticket-main">
                      <div className="watermark">🐈</div>
                      <div className="ticket-top">
                        <span className="gov-text">สลากกินแบ่งรัฐบาล</span>
                        <div className="barcode-placeholder"></div>
                      </div>

                      <HighlightNumber
                        numbers={item.numbers}
                        digits={searchedDigits}
                      />

                      <div className="ticket-bottom">
                        <div>งวดที่ {item.roundNumber}</div>
                        <div>เล่มที่ {item.bookNumber}</div>
                      </div>
                    </div>
                  </div>

                  <div className="buy-bar">
                    <div className="price-tag">
                      ใบละ <span className="price-highlight">{item.sale}</span>{" "}
                      ฿
                    </div>
                    <button
                      className={`btn-cart ${cartFeedback[item.id] ? "added" : ""}`}
                      onClick={() => handleAddToCart(item)}
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

      {/* 🌟 Custom Payment Modal 🌟 */}
      {showPaymentModal && (
        <div
          className="cat-modal-overlay"
          onClick={() => setShowPaymentModal(false)}
        >
          <div
            className="cat-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cat-modal-header">
              <h3 className="cat-modal-title">🐾 ยืนยันการสั่งซื้อ</h3>
              <button
                className="btn-close-modal"
                onClick={() => setShowPaymentModal(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="cat-modal-body">
              {/* กล่องข้อมูลบัญชีธนาคาร */}
              <div className="bank-details-box">
                <p className="mb-1 text-muted" style={{ fontSize: "14px" }}>
                  โปรดโอนเงินไปยังบัญชีธนาคาร:
                </p>
                <p className="mb-1 fw-bold text-dark">บริษัท แผงแมวส้ม จำกัด</p>
                <p className="mb-1">ธนาคารกสิกรไทย (KBank)</p>
                <div className="account-number ">123-4-56789-0</div>
                <div className="total-amount-box mt-3">
                  ยอดที่ต้องชำระ:
                  <span className="ms-2 amount-highlight">
                    {carts.reduce(
                      (total, current) => total + current.item.sale,
                      0,
                    )}{" "}
                    ฿
                  </span>
                </div>
                <p
                  className="mt-3 mb-0 text-muted"
                  style={{ fontSize: "13px" }}
                >
                  <i className="bi bi-info-circle me-1"></i>
                  และอัพโหลดสลิปไปที่ Line:{" "}
                  <strong style={{ color: "#00b900" }}>@FYui888</strong>
                </p>
              </div>

              {/* ฟอร์มกรอกข้อมูล */}
              <div className="custom-form mt-4">
                <div className="form-group mb-3">
                  <label>ชื่อผู้ซื้อ</label>
                  <input
                    type="text"
                    className="cat-input"
                    placeholder="กรอกชื่อ-นามสกุล"
                  />
                </div>
                <div className="form-group mb-3">
                  <label>เบอร์โทรศัพท์</label>
                  <input
                    type="tel"
                    className="cat-input"
                    placeholder="08X-XXX-XXXX"
                  />
                </div>
                <div className="form-group mb-4">
                  <label>
                    ที่อยู่จัดส่ง
                    <span className="sub-label">
                      (หากฝากสลากไว้ที่ร้าน ไม่ต้องกรอก)
                    </span>
                  </label>
                  <textarea
                    className="cat-input"
                    rows="2"
                    placeholder="กรอกที่อยู่สำหรับจัดส่งสลากใบจริง..."
                  ></textarea>
                </div>
              </div>

              {/* ปุ่มยืนยัน */}
              <button className="btn-confirm-order">
                <i className="bi bi-check-circle-fill me-2"></i>
                ยืนยันการสั่งซื้อ
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

// ─── sub-components ───────────────────────────────────────────────────────────

function LoadingDots() {
  return (
    <div className="loading-wrap">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="dot"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

function EmptyState({ searched, query, onClear }) {
  return (
    <div className={`empty-state ${searched ? "searched" : ""}`}>
      <div style={{ fontSize: "70px" }}>{searched ? "😿" : "😿"}</div>
      {searched ? (
        <>
          <h4 style={{ color: "#dc2626", marginTop: "15px" }}>
            ไม่พบเลข "{query}"
          </h4>
          <p style={{ color: "#999", marginBottom: "16px" }}>
            ไม่มีสลากที่ตรงเงื่อนไข ลองค้นหาเลขอื่นดูอีกครั้งนะครับ
          </p>
          <button className="btn-clear-large" onClick={onClear}>
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

export default Index;
