import Home from "./Home";
import { useEffect, useState } from "react";
import AuthService from "../services/auth.service";
import UserService from "../services/user.service";
import Swal from "sweetalert2";
import MyModal from "../components/MyModal";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

function User() {
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState(null);
  const [userLevel, setUserLevel] = useState("user");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const [usersList, setUsersList] = useState([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);

  // 🌟 อัปเกรด State: เพิ่ม name, email, phone, address เข้ามาด้วย
  const [userForm, setUserForm] = useState({
    user: "",
    pwd: "",
    level: "admin",
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userLevel === "admin") {
      fetchUsersList();
    }
  }, [userLevel]);

  const fetchUserData = async () => {
    try {
      const res = await AuthService.getUserInfo();
      if (res.data && res.data.payload) {
        setUserName(res.data.payload.user);
        setUserId(res.data.payload.sub);
        setUserLevel(res.data.payload.level);
      }
    } catch (e) {
      console.error("🔥 Fetch User Error:", e);
    }
  };

  const fetchUsersList = async () => {
    setIsUsersLoading(true);
    try {
      const res = await UserService.list();
      setUsersList(res.data || []);
    } catch (e) {
      console.error("🔥 Fetch Users Error:", e);
    } finally {
      setIsUsersLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      Toast.fire({ icon: "warning", title: "กรุณากรอกข้อมูลให้ครบถ้วน 😿" });
      return;
    }
    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน",
        confirmButtonColor: "#ea580c",
      });
      return;
    }

    setIsProfileLoading(true);
    try {
      const payload = { oldPassword, newPassword };
      await UserService.changePassword(userId, payload);

      Toast.fire({ icon: "success", title: "อัปเดตรหัสผ่านเรียบร้อย! 🎉" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      const errorMsg =
        e.response?.data?.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้";
      Swal.fire({
        icon: "error",
        title: "เปลี่ยนรหัสผ่านไม่สำเร็จ",
        text: errorMsg,
        confirmButtonColor: "#ea580c",
      });
    } finally {
      setIsProfileLoading(false);
    }
  };

  // ==========================================
  // 🌟 ฟังก์ชันจัดการ Modal พนักงาน (อัปเดตฟิลด์ใหม่)
  // ==========================================
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setUserForm({
      user: "",
      pwd: "",
      level: "admin",
      name: "",
      email: "",
      phone: "",
      address: "",
    });
  };

  const handleOpenEditModal = (userData) => {
    setIsEditing(true);
    setEditId(userData.id);
    setUserForm({
      user: userData.user || userData.username || "",
      pwd: "",
      level: userData.level || "admin",
      name: userData.name || "",
      email: userData.email || "",
      phone: userData.phone || "",
      address: userData.address || "",
    });
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!userForm.user || !userForm.level || (!isEditing && !userForm.pwd)) {
      Toast.fire({
        icon: "warning",
        title: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน!",
      });
      return;
    }

    try {
      const payload = { ...userForm };
      if (isEditing && !payload.pwd) {
        delete payload.pwd;
      }

      if (isEditing) {
        await UserService.edit(editId, payload);
        Toast.fire({ icon: "success", title: "อัปเดตข้อมูลพนักงานสำเร็จ 📝" });
      } else {
        await UserService.create(payload);
        Toast.fire({ icon: "success", title: "เพิ่มพนักงานใหม่เรียบร้อย ➕" });
      }

      document.getElementById("closeModalBtn").click();
      fetchUsersList();
    } catch (e) {
      const errorMsg = e.response?.data?.message;
      const displayMsg = Array.isArray(errorMsg)
        ? errorMsg.join(", ")
        : errorMsg;
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: displayMsg || "ไม่สามารถบันทึกข้อมูลได้",
      });
    }
  };

  const handleDeleteUser = async (id, name) => {
    Swal.fire({
      title: `ลบพนักงาน ${name}?`,
      text: "คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้ออกจากระบบ ข้อมูลจะไม่สามารถกู้คืนได้นะเจ้านาย!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await UserService.remove(id);
          Toast.fire({ icon: "success", title: "ลบพนักงานออกจากระบบแล้ว 🗑️" });
          fetchUsersList();
        } catch (e) {
          Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            text: "ไม่สามารถลบข้อมูลได้",
          });
        }
      }
    });
  };

  return (
    <>
      <Home>
        <div
          className="container-fluid px-3 px-md-4 pb-4 pt-3"
          style={{ backgroundColor: "#fafaf9", minHeight: "100vh" }}
        >
          <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
            <div className="h3 mb-0 fw-bold" style={{ color: "#ea580c" }}>
              👤 ระบบผู้ใช้งาน
            </div>
          </div>

          <style>
            {`
              .cat-theme-tabs .nav-link { color: #6b7280; transition: all 0.3s ease; }
              .cat-theme-tabs .nav-link:hover { color: #ea580c; background-color: #fff7ed; }
              .cat-theme-tabs .nav-link.active {
                background-color: #ea580c !important; 
                color: white !important;
                box-shadow: 0 4px 6px -1px rgba(234, 88, 12, 0.3); 
              }
            `}
          </style>

          <ul
            className="nav nav-pills mb-4 bg-white p-2 shadow-sm rounded-4 border cat-theme-tabs"
            id="userTabs"
            role="tablist"
          >
            <li className="nav-item" role="presentation">
              <button
                className="nav-link active rounded-pill px-4 fw-bold"
                id="profile-tab"
                data-bs-toggle="pill"
                data-bs-target="#profile-pane"
                type="button"
                role="tab"
              >
                <i className="bi bi-person-badge me-2"></i> โปรไฟล์ส่วนตัว
              </button>
            </li>

            {userLevel === "admin" && (
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link rounded-pill px-4 fw-bold"
                  id="manage-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#manage-pane"
                  type="button"
                  role="tab"
                >
                  <i className="bi bi-people-fill me-2"></i> จัดการพนักงาน
                </button>
              </li>
            )}
          </ul>

          <div className="tab-content" id="userTabsContent">
            {/* 🔴 Tab 1: โปรไฟล์ส่วนตัว */}
            <div
              className="tab-pane fade show active"
              id="profile-pane"
              role="tabpanel"
            >
              <div className="row g-4">
                <div className="col-12 col-lg-4">
                  <div className="card border-0 shadow-sm rounded-4 text-center p-4 bg-white position-relative overflow-hidden h-100">
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "8px",
                        backgroundColor: "#ea580c",
                      }}
                    ></div>
                    <div className="card-body pt-3">
                      <div
                        className="mx-auto d-flex align-items-center justify-content-center border shadow-sm"
                        style={{
                          width: "100px",
                          height: "100px",
                          borderRadius: "50%",
                          backgroundColor: "#fff7ed",
                          borderColor: "#fed7aa",
                        }}
                      >
                        <span style={{ fontSize: "3.5rem" }}>🐈</span>
                      </div>
                      <h4 className="fw-bold text-dark mt-3 mb-1">
                        {userName || "เจ้านายแผงแมวส้ม"}
                      </h4>
                      {userLevel === "admin" ? (
                        <div
                          className="d-inline-block rounded-pill px-4 py-2 border mt-3"
                          style={{
                            backgroundColor: "#fff7ed",
                            color: "#9a3412",
                            borderColor: "#ffedd5",
                            fontWeight: "bold",
                            fontSize: "14px",
                          }}
                        >
                          <i className="bi bi-shield-lock-fill me-2"></i>{" "}
                          สิทธิ์ระบบ: Admin
                        </div>
                      ) : (
                        <div
                          className="d-inline-block rounded-pill px-4 py-2 border mt-3"
                          style={{
                            backgroundColor: "#f0fdf4",
                            color: "#166534",
                            borderColor: "#bbf7d0",
                            fontWeight: "bold",
                            fontSize: "14px",
                          }}
                        >
                          <i className="bi bi-person-check-fill me-2"></i>{" "}
                          สิทธิ์ระบบ: พนักงาน
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-12 col-lg-8">
                  <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                    <div className="card-header bg-white border-0 p-0 pb-3 mb-3 border-bottom">
                      <h5 className="fw-bold mb-0 text-dark">
                        <i className="bi bi-key-fill me-2 text-warning"></i>{" "}
                        เปลี่ยนรหัสผ่านเพื่อความปลอดภัย
                      </h5>
                    </div>
                    <div className="card-body p-0">
                      <form onSubmit={handleChangePassword}>
                        <div className="mb-4">
                          <label className="form-label fw-bold text-secondary mb-2">
                            รหัสผ่านปัจจุบัน
                          </label>
                          <div className="input-group shadow-sm rounded-3 border overflow-hidden">
                            <span className="input-group-text bg-light border-0 text-muted">
                              <i className="bi bi-lock"></i>
                            </span>
                            <input
                              type="password"
                              className="form-control border-0 bg-light p-2.5"
                              placeholder="••••••••"
                              value={oldPassword}
                              onChange={(e) => setOldPassword(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="form-label fw-bold text-secondary mb-2">
                            รหัสผ่านใหม่
                          </label>
                          <div className="input-group shadow-sm rounded-3 border overflow-hidden">
                            <span className="input-group-text bg-light border-0 text-muted">
                              <i className="bi bi-shield-lock"></i>
                            </span>
                            <input
                              type="password"
                              className="form-control border-0 bg-light p-2.5"
                              placeholder="ระบุรหัสผ่านใหม่ 6 หลักขึ้นไป"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="form-label fw-bold text-secondary mb-2">
                            ยืนยันรหัสผ่านใหม่
                          </label>
                          <div className="input-group shadow-sm rounded-3 border overflow-hidden">
                            <span className="input-group-text bg-light border-0 text-muted">
                              <i className="bi bi-shield-check"></i>
                            </span>
                            <input
                              type="password"
                              className="form-control border-0 bg-light p-2.5"
                              placeholder="กรอกรหัสผ่านใหม่อีกครั้งให้ตรงกัน"
                              value={confirmPassword}
                              onChange={(e) =>
                                setConfirmPassword(e.target.value)
                              }
                            />
                          </div>
                        </div>
                        <div className="pt-2">
                          <button
                            type="submit"
                            disabled={isProfileLoading}
                            className="btn rounded-pill px-4 shadow-sm fw-bold transition-all"
                            style={{
                              backgroundColor: "#ea580c",
                              color: "white",
                              padding: "10px 25px",
                            }}
                          >
                            {isProfileLoading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                กำลังบันทึก...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-check-circle-fill me-2"></i>{" "}
                                อัปเดตรหัสผ่านใหม่
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 🔴 Tab 2: จัดการพนักงาน */}
            {userLevel === "admin" && (
              <div className="tab-pane fade" id="manage-pane" role="tabpanel">
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                  <div className="card-header bg-white border-0 pt-4 pb-3 d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold mb-0 text-dark">
                      <i
                        className="bi bi-people-fill me-2"
                        style={{ color: "#ea580c" }}
                      ></i>{" "}
                      รายชื่อพนักงานในระบบ
                    </h5>
                    <button
                      className="btn btn-sm text-white fw-bold px-3 py-2 rounded-pill shadow-sm"
                      style={{ backgroundColor: "#ea580c" }}
                      data-bs-toggle="modal"
                      data-bs-target="#userModal"
                      onClick={handleOpenAddModal}
                    >
                      <i className="bi bi-plus-lg me-1"></i> เพิ่มพนักงาน
                    </button>
                  </div>

                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0 text-center">
                        <thead style={{ backgroundColor: "#ffedd5" }}>
                          <tr>
                            <th className="px-3 py-3 border-0 text-secondary">
                              ID
                            </th>
                            <th className="px-3 py-3 border-0 text-secondary text-start">
                              ชื่อพนักงาน / Username
                            </th>
                            <th className="px-3 py-3 border-0 text-secondary">
                              ติดต่อ
                            </th>
                            <th className="px-3 py-3 border-0 text-secondary">
                              สิทธิ์ (Level)
                            </th>
                            <th className="px-3 py-3 border-0 text-secondary">
                              จัดการ
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {isUsersLoading ? (
                            <tr>
                              <td colSpan="5" className="py-5 text-muted">
                                กำลังโหลดข้อมูล...
                              </td>
                            </tr>
                          ) : usersList.length > 0 ? (
                            usersList.map((user, index) => (
                              <tr key={user.id || index}>
                                <td className="text-muted fw-bold">
                                  #{user.id}
                                </td>
                                <td className="text-start">
                                  {/* 🌟 แสดงชื่อ (ถ้ามี) ตามด้วย Username */}
                                  <div className="fw-bold text-dark">
                                    {user.name
                                      ? user.name
                                      : user.user || user.username}
                                  </div>
                                  {user.name && (
                                    <div className="text-muted small">
                                      @{user.user || user.username}
                                    </div>
                                  )}
                                </td>
                                <td>
                                  {/* 🌟 แสดงเบอร์โทร หรือ อีเมล แบบย่อ */}
                                  <div className="small text-muted">
                                    {user.phone ? (
                                      <>
                                        <i className="bi bi-telephone me-1"></i>
                                        {user.phone}
                                        <br />
                                      </>
                                    ) : (
                                      ""
                                    )}
                                    {user.email ? (
                                      <>
                                        <i className="bi bi-envelope me-1"></i>
                                        {user.email}
                                      </>
                                    ) : (
                                      !user.phone && "-"
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <span
                                    className="badge rounded-pill px-3 py-2"
                                    style={
                                      user.level === "admin"
                                        ? {
                                            backgroundColor: "#ea580c", // พื้นหลังสีส้มเข้ม (เข้าธีมเว็บ)
                                            color: "#ffffff", // ตัวหนังสือสีขาว
                                            boxShadow:
                                              "0 2px 4px rgba(234, 88, 12, 0.4)", // เงามีมิติสีส้ม
                                            letterSpacing: "0.5px", // ถ่างตัวหนังสือนิดนึงให้ดูแพง
                                            fontWeight: "600",
                                          }
                                        : {
                                            backgroundColor: "#f3f4f6", // พื้นหลังสีเทาอ่อนสุดคลีน
                                            color: "#4b5563", // ตัวหนังสือสีเทาเข้ม
                                            border: "1px solid #d1d5db", // ขอบสีเทาบางๆ
                                            letterSpacing: "0.5px",
                                            fontWeight: "500",
                                          }
                                    }
                                  >
                                    {user.level === "admin" ? (
                                      <>
                                        <i
                                          className="bi bi-shield-lock-fill me-1"
                                          style={{ color: "#fde68a" }}
                                        ></i>{" "}
                                        Admin
                                      </>
                                    ) : (
                                      <>
                                        <i className="bi bi-person-fill me-1 text-secondary"></i>{" "}
                                        User
                                      </>
                                    )}
                                  </span>
                                </td>
                                <td>
                                  <button
                                    className="btn btn-sm btn-outline-primary rounded-pill px-3 me-2"
                                    data-bs-toggle="modal"
                                    data-bs-target="#userModal"
                                    onClick={() => handleOpenEditModal(user)}
                                  >
                                    <i className="bi bi-pencil-square"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger rounded-pill px-3"
                                    onClick={() =>
                                      handleDeleteUser(
                                        user.id,
                                        user.name || user.user || user.username,
                                      )
                                    }
                                  >
                                    <i className="bi bi-trash-fill"></i>
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="py-5 text-muted">
                                ยังไม่มีข้อมูลพนักงาน
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Home>

      {/* ========================================== */}
      {/* 🌟 Modal สำหรับ เพิ่ม / แก้ไข พนักงาน (อัปเดตช่องใหม่) */}
      {/* ========================================== */}
      <MyModal
        id="userModal"
        title={isEditing ? "✏️ แก้ไขข้อมูลพนักงาน" : "➕ เพิ่มพนักงานใหม่"}
      >
        <form onSubmit={handleSaveUser}>
          <div
            className="modal-body p-4"
            style={{ maxHeight: "60vh", overflowY: "auto" }}
          >
            {/* --- ข้อมูลจำเป็น (บังคับกรอก) --- */}
            <h6 className="fw-bold mb-3" style={{ color: "#ea580c" }}>
              <i className="bi bi-person-badge me-2"></i>ข้อมูลสำหรับเข้าสู่ระบบ
              (บังคับ)
            </h6>

            <div className="mb-3">
              <label className="form-label fw-bold small text-secondary">
                ชื่อเข้าใช้งาน (Username) <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted">
                  <i className="bi bi-person-fill"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-light"
                  placeholder="กรอกชื่อผู้ใช้งาน"
                  value={userForm.user}
                  onChange={(e) =>
                    setUserForm({ ...userForm, user: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold small text-secondary">
                รหัสผ่าน (Password){" "}
                {isEditing ? (
                  <span className="text-muted fw-normal">
                    (เว้นว่างถ้าไม่เปลี่ยน)
                  </span>
                ) : (
                  <span className="text-danger">*</span>
                )}
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted">
                  <i className="bi bi-key-fill"></i>
                </span>
                <input
                  type="password"
                  className="form-control bg-light"
                  placeholder={
                    isEditing ? "ปล่อยว่างเพื่อใช้รหัสเดิม" : "กรอกรหัสผ่านใหม่"
                  }
                  value={userForm.pwd}
                  onChange={(e) =>
                    setUserForm({ ...userForm, pwd: e.target.value })
                  }
                  required={!isEditing}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold small text-secondary">
                ระดับสิทธิ์ (Level) <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted">
                  <i className="bi bi-shield-lock-fill"></i>
                </span>
                <select
                  className="form-select bg-light"
                  value={userForm.level}
                  onChange={(e) =>
                    setUserForm({ ...userForm, level: e.target.value })
                  }
                  required
                >
                  <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                  <option value="user">พนักงานทั่วไป (User)</option>
                </select>
              </div>
            </div>

            <hr className="my-4 text-muted opacity-25" />

            {/* --- ข้อมูลทั่วไป (ทางเลือก) --- */}
            <h6 className="fw-bold mb-3 text-secondary">
              <i className="bi bi-card-text me-2"></i>ข้อมูลพนักงาน (ไม่บังคับ)
            </h6>

            <div className="mb-3">
              <label className="form-label fw-bold small text-secondary">
                ชื่อ-นามสกุล (Name)
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted">
                  <i className="bi bi-person-vcard"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-light"
                  placeholder="ชื่อ และ นามสกุล"
                  value={userForm.name}
                  onChange={(e) =>
                    setUserForm({ ...userForm, name: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="form-label fw-bold small text-secondary">
                  เบอร์โทรศัพท์ (Phone)
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted">
                    <i className="bi bi-telephone"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control bg-light"
                    placeholder="08X-XXX-XXXX"
                    value={userForm.phone}
                    onChange={(e) =>
                      setUserForm({ ...userForm, phone: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="col-6">
                <label className="form-label fw-bold small text-secondary">
                  อีเมล (Email)
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control bg-light"
                    placeholder="example@email.com"
                    value={userForm.email}
                    onChange={(e) =>
                      setUserForm({ ...userForm, email: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="mb-2">
              <label className="form-label fw-bold small text-secondary">
                ที่อยู่ (Address)
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted">
                  <i className="bi bi-house"></i>
                </span>
                <textarea
                  className="form-control bg-light"
                  placeholder="ที่อยู่ปัจจุบัน"
                  rows="2"
                  value={userForm.address}
                  onChange={(e) =>
                    setUserForm({ ...userForm, address: e.target.value })
                  }
                ></textarea>
              </div>
            </div>
          </div>
          <div className="modal-footer border-0 pb-4 pe-4 bg-light rounded-bottom-4">
            <button
              type="button"
              className="btn btn-secondary rounded-pill px-4"
              id="closeModalBtn"
              data-bs-dismiss="modal"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="btn rounded-pill px-4 fw-bold shadow-sm"
              style={{ backgroundColor: "#ea580c", color: "white" }}
            >
              <i className="bi bi-save-fill me-2"></i> บันทึกข้อมูล
            </button>
          </div>
        </form>
      </MyModal>
    </>
  );
}

export default User;
