import Home from "./Home";
import { useEffect, useState } from "react";
import AuthService from "../services/auth.service";
import UserService from "../services/user.service";
import Swal from "sweetalert2";
import MyModal from "../components/MyModal";
import { PageHeader } from "../components/shared/PageHeader";
import {
  FilterBar,
  FilterBarSearch,
  FilterBarButton,
  FilterBarClear,
} from "../components/shared/FilterBar";

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
  const [isSavingUser, setIsSavingUser] = useState(false);

  // 🌟 ตรวจสอบว่ารหัสผ่านใหม่กับยืนยันรหัสผ่านตรงกันหรือไม่ (สำหรับ aria-invalid)
  const passwordMismatch =
    newPassword.length > 0 &&
    confirmPassword.length > 0 &&
    newPassword !== confirmPassword;

  const [usersList, setUsersList] = useState([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [usersLoadError, setUsersLoadError] = useState(false);
  const [userSearch, setUserSearch] = useState("");

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
    setUsersLoadError(false);
    try {
      const res = await UserService.list();
      setUsersList(res.data || []);
    } catch (e) {
      console.error("🔥 Fetch Users Error:", e);
      setUsersLoadError(true);
    } finally {
      setIsUsersLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      Toast.fire({ icon: "warning", title: "กรุณากรอกข้อมูลให้ครบถ้วน" });
      return;
    }
    if (passwordMismatch) {
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน",
        confirmButtonColor: "var(--brand-600)",
      });
      return;
    }

    setIsProfileLoading(true);
    try {
      const payload = { oldPassword, newPassword };
      await UserService.changePassword(userId, payload);

      Toast.fire({ icon: "success", title: "อัปเดตรหัสผ่านเรียบร้อย!" });
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
        confirmButtonColor: "var(--brand-600)",
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
    if (isSavingUser) return; // 🛡️ กันกดซ้ำระหว่างรอผลบันทึก (กันสร้าง/แก้พนักงานซ้ำ)
    if (!userForm.user || !userForm.level || (!isEditing && !userForm.pwd)) {
      Toast.fire({
        icon: "warning",
        title: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน!",
      });
      return;
    }

    setIsSavingUser(true);
    try {
      const payload = { ...userForm };
      if (isEditing && !payload.pwd) {
        delete payload.pwd;
      }

      if (isEditing) {
        await UserService.edit(editId, payload);
        Toast.fire({ icon: "success", title: "อัปเดตข้อมูลพนักงานสำเร็จ" });
      } else {
        await UserService.create(payload);
        Toast.fire({ icon: "success", title: "เพิ่มพนักงานใหม่เรียบร้อย" });
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
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    Swal.fire({
      title: `ลบพนักงาน ${name}?`,
      text: "คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้ออกจากระบบ ข้อมูลจะไม่สามารถกู้คืนได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "var(--red-600)",
      cancelButtonColor: "var(--slate-400)",
      confirmButtonText: "ยืนยันการลบ",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await UserService.remove(id);
          Toast.fire({ icon: "success", title: "ลบพนักงานออกจากระบบแล้ว" });
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

  // 🌟 ค้นหาพนักงานฝั่ง client จากรายชื่อที่โหลดมาแล้ว (ไม่ยิง API เพิ่ม)
  const filteredUsers = usersList.filter((user) => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return true;
    const haystack = [user.name, user.user, user.username, user.email, user.phone]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });

  return (
    <>
      <Home>
        <div
          className="container-fluid px-3 px-md-4 pb-4 pt-3"
          style={{ backgroundColor: "var(--slate-50)", minHeight: "100vh" }}
        >
          <PageHeader
            eyebrow="ตั้งค่าระบบ"
            title="ระบบผู้ใช้งาน"
            description="จัดการโปรไฟล์ของคุณ และดูแลบัญชีพนักงานในระบบ"
          />

          <style>
            {`
              .cat-theme-tabs .nav-link { color: var(--slate-500); transition: all 0.2s ease; }
              .cat-theme-tabs .nav-link:hover { color: var(--blue-700); background-color: var(--blue-50); }
              .cat-theme-tabs .nav-link.active {
                background-color: var(--blue-50) !important;
                color: var(--blue-700) !important;
                box-shadow: none;
              }
            `}
          </style>

          <ul
            className="nav nav-pills mb-4 bg-white p-2 border rounded-4 cat-theme-tabs"
            style={{ borderColor: "var(--slate-200)" }}
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
                  <div
                    className="card border text-center p-4 bg-white h-100"
                    style={{ borderColor: "var(--slate-200)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-card)" }}
                  >
                    <div className="card-body pt-3">
                      <div
                        className="mx-auto d-flex align-items-center justify-content-center border"
                        style={{
                          width: "100px",
                          height: "100px",
                          borderRadius: "50%",
                          backgroundColor: "var(--slate-50)",
                          borderColor: "var(--slate-200)",
                        }}
                      >
                        <span style={{ fontSize: "3.5rem" }}>🐈</span>
                      </div>
                      <h4 className="fw-bold text-dark mt-3 mb-1">
                        {userName || "ผู้ใช้งานแผงแมวส้ม"}
                      </h4>
                      {userLevel === "admin" ? (
                        <div
                          className="d-inline-block rounded-pill px-4 py-2 mt-3"
                          style={{
                            backgroundColor: "var(--blue-50)",
                            color: "var(--blue-700)",
                            fontWeight: "700",
                            fontSize: "13px",
                          }}
                        >
                          สิทธิ์ระบบ: Admin
                        </div>
                      ) : (
                        <div
                          className="d-inline-block rounded-pill px-4 py-2 mt-3"
                          style={{
                            backgroundColor: "var(--green-100)",
                            color: "var(--green-700)",
                            fontWeight: "700",
                            fontSize: "13px",
                          }}
                        >
                          สิทธิ์ระบบ: พนักงาน
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-12 col-lg-8">
                  <div
                    className="card border p-4 bg-white h-100"
                    style={{ borderColor: "var(--slate-200)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-card)" }}
                  >
                    <div className="card-header bg-white border-0 p-0 pb-3 mb-3 border-bottom">
                      <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: "16px" }}>
                        เปลี่ยนรหัสผ่านเพื่อความปลอดภัย
                      </h5>
                    </div>
                    <div className="card-body p-0">
                      <form onSubmit={handleChangePassword}>
                        <div className="mb-4">
                          <label
                            htmlFor="oldPasswordInput"
                            className="form-label fw-bold text-secondary mb-2"
                          >
                            รหัสผ่านปัจจุบัน
                          </label>
                          <div className="input-group shadow-sm rounded-3 border overflow-hidden">
                            <span className="input-group-text bg-light border-0 text-muted">
                              <i className="bi bi-lock"></i>
                            </span>
                            <input
                              id="oldPasswordInput"
                              type="password"
                              className="form-control border-0 bg-light p-2.5"
                              placeholder="••••••••"
                              value={oldPassword}
                              onChange={(e) => setOldPassword(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="mb-4">
                          <label
                            htmlFor="newPasswordInput"
                            className="form-label fw-bold text-secondary mb-2"
                          >
                            รหัสผ่านใหม่
                          </label>
                          <div className="input-group shadow-sm rounded-3 border overflow-hidden">
                            <span className="input-group-text bg-light border-0 text-muted">
                              <i className="bi bi-shield-lock"></i>
                            </span>
                            <input
                              id="newPasswordInput"
                              type="password"
                              className="form-control border-0 bg-light p-2.5"
                              placeholder="ระบุรหัสผ่านใหม่ 6 หลักขึ้นไป"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              aria-invalid={passwordMismatch}
                            />
                          </div>
                        </div>
                        <div className="mb-4">
                          <label
                            htmlFor="confirmPasswordInput"
                            className="form-label fw-bold text-secondary mb-2"
                          >
                            ยืนยันรหัสผ่านใหม่
                          </label>
                          <div className="input-group shadow-sm rounded-3 border overflow-hidden">
                            <span className="input-group-text bg-light border-0 text-muted">
                              <i className="bi bi-shield-check"></i>
                            </span>
                            <input
                              id="confirmPasswordInput"
                              type="password"
                              className="form-control border-0 bg-light p-2.5"
                              placeholder="กรอกรหัสผ่านใหม่อีกครั้งให้ตรงกัน"
                              value={confirmPassword}
                              onChange={(e) =>
                                setConfirmPassword(e.target.value)
                              }
                              aria-invalid={passwordMismatch}
                            />
                          </div>
                        </div>
                        <div className="pt-2">
                          <button
                            type="submit"
                            disabled={isProfileLoading}
                            className="btn px-4 fw-semibold"
                            style={{
                              backgroundColor: "var(--blue-50)",
                              color: "var(--blue-700)",
                              border: "1px solid var(--blue-100, var(--blue-50))",
                              borderRadius: "var(--radius-sm)",
                              padding: "10px 25px",
                              fontSize: "14px",
                            }}
                          >
                            {isProfileLoading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                กำลังบันทึก...
                              </>
                            ) : (
                              "อัปเดตรหัสผ่านใหม่"
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
                <FilterBar
                  actions={
                    <FilterBarButton
                      variant="primary"
                      icon="bi-plus-lg"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#userModal"
                      onClick={handleOpenAddModal}
                    >
                      เพิ่มพนักงาน
                    </FilterBarButton>
                  }
                >
                  <FilterBarSearch
                    value={userSearch}
                    onChange={setUserSearch}
                    placeholder="ค้นหาชื่อ, username, เบอร์โทร..."
                  />
                  <FilterBarClear
                    show={!!userSearch}
                    onClick={() => setUserSearch("")}
                  />
                </FilterBar>

                <div
                  className="card border overflow-hidden bg-white"
                  style={{ borderColor: "var(--slate-200)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-card)" }}
                >
                  <div className="card-body p-0">
                    {usersLoadError && !isUsersLoading && (
                      <div
                        className="d-flex flex-wrap align-items-center justify-content-between gap-2 px-4 py-3 m-3 rounded-3"
                        style={{
                          backgroundColor: "var(--red-50, #fef2f2)",
                          border: "1px solid var(--red-200, #fecaca)",
                          color: "var(--red-600)",
                        }}
                      >
                        <span className="fw-bold">
                          <i className="bi bi-exclamation-triangle-fill me-2"></i>
                          โหลดรายชื่อพนักงานไม่สำเร็จ
                        </span>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold"
                          onClick={fetchUsersList}
                        >
                          <i className="bi bi-arrow-clockwise me-1"></i> ลองใหม่
                        </button>
                      </div>
                    )}
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0 text-center">
                        <thead style={{ backgroundColor: "var(--slate-50)" }}>
                          <tr>
                            <th scope="col" className="px-3 py-3 border-0" style={{ color: "var(--slate-500)", fontWeight: 600, fontSize: "13px" }}>
                              ID
                            </th>
                            <th scope="col" className="px-3 py-3 border-0 text-start" style={{ color: "var(--slate-500)", fontWeight: 600, fontSize: "13px" }}>
                              ชื่อพนักงาน / Username
                            </th>
                            <th scope="col" className="px-3 py-3 border-0" style={{ color: "var(--slate-500)", fontWeight: 600, fontSize: "13px" }}>
                              ติดต่อ
                            </th>
                            <th scope="col" className="px-3 py-3 border-0" style={{ color: "var(--slate-500)", fontWeight: 600, fontSize: "13px" }}>
                              สิทธิ์ (Level)
                            </th>
                            <th scope="col" className="px-3 py-3 border-0" style={{ color: "var(--slate-500)", fontWeight: 600, fontSize: "13px" }}>
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
                          ) : filteredUsers.length > 0 ? (
                            filteredUsers.map((user, index) => (
                              <tr key={user.id || index}>
                                <td className="fw-bold" style={{ color: "var(--blue-700)" }}>
                                  #{user.id}
                                </td>
                                <td className="text-start">
                                  <div className="fw-bold" style={{ color: "var(--slate-800)", fontSize: "14px" }}>
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
                                  <div className="small text-muted">
                                    {user.phone ? (
                                      <>
                                        {user.phone}
                                        <br />
                                      </>
                                    ) : (
                                      ""
                                    )}
                                    {user.email ? (
                                      user.email
                                    ) : (
                                      !user.phone && "-"
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <span
                                    style={
                                      user.level === "admin"
                                        ? {
                                            backgroundColor: "var(--blue-50)",
                                            color: "var(--blue-700)",
                                            padding: "3px 14px",
                                            borderRadius: "var(--radius-pill)",
                                            fontSize: "12px",
                                            fontWeight: 700,
                                            display: "inline-block",
                                          }
                                        : {
                                            backgroundColor: "var(--slate-100)",
                                            color: "var(--slate-500)",
                                            padding: "3px 14px",
                                            borderRadius: "var(--radius-pill)",
                                            fontSize: "12px",
                                            fontWeight: 700,
                                            display: "inline-block",
                                          }
                                    }
                                  >
                                    {user.level === "admin" ? "Admin" : "User"}
                                  </span>
                                </td>
                                <td>
                                  <div className="d-flex justify-content-center align-items-center" style={{ gap: "6px" }}>
                                    <button
                                      data-bs-toggle="offcanvas"
                                      data-bs-target="#userModal"
                                      onClick={() => handleOpenEditModal(user)}
                                      aria-label="แก้ไข"
                                      title="แก้ไข"
                                      style={{
                                        background: "var(--color-white)",
                                        color: "var(--slate-600)",
                                        border: "1px solid var(--slate-200)",
                                        width: "32px",
                                        height: "32px",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderRadius: "var(--radius-sm)",
                                        fontSize: "14px",
                                        flexShrink: 0,
                                      }}
                                    >
                                      <i className="bi bi-pencil-square"></i>
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteUser(
                                          user.id,
                                          user.name || user.user || user.username,
                                        )
                                      }
                                      aria-label="ลบ"
                                      title="ลบ"
                                      style={{
                                        background: "var(--red-50)",
                                        color: "var(--red-600)",
                                        border: "1px solid var(--red-100)",
                                        width: "32px",
                                        height: "32px",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderRadius: "var(--radius-sm)",
                                        fontSize: "14px",
                                        flexShrink: 0,
                                      }}
                                    >
                                      <i className="bi bi-trash-fill"></i>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="py-5 text-muted">
                                {userSearch
                                  ? `ไม่พบพนักงานที่ตรงกับ "${userSearch}"`
                                  : "ยังไม่มีข้อมูลพนักงาน"}
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
        variant="drawer"
        title={isEditing ? "แก้ไขข้อมูลพนักงาน" : "เพิ่มพนักงานใหม่"}
      >
        <form onSubmit={handleSaveUser} className="d-flex flex-column h-100">
          <div className="modal-body p-4 flex-grow-1 overflow-auto">
            {/* --- ข้อมูลจำเป็น (บังคับกรอก) --- */}
            <h6 className="fw-bold mb-3" style={{ color: "var(--brand-600)" }}>
              <i className="bi bi-person-badge me-2"></i>ข้อมูลสำหรับเข้าสู่ระบบ
            </h6>

            <div className="mb-3">
              <label className="form-label fw-bold small text-secondary">
                ชื่อผู้ใช้งาน <span className="text-danger">*</span>
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
                รหัสผ่าน{" "}
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
              <i className="bi bi-card-text me-2"></i>ข้อมูลพนักงาน
            </h6>

            <div className="mb-3">
              <label className="form-label fw-bold small text-secondary">
                ชื่อ-นามสกุล
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
              <div className="col-12 col-sm-6">
                <label className="form-label fw-bold small text-secondary">
                  เบอร์โทรศัพท์
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
              <div className="col-12 col-sm-6">
                <label className="form-label fw-bold small text-secondary">
                  อีเมล
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
                ที่อยู่
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
              data-bs-dismiss="offcanvas"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="btn px-4 fw-semibold"
              disabled={isSavingUser}
              style={{
                backgroundColor: "var(--blue-50)",
                color: "var(--blue-700)",
                border: "1px solid var(--blue-100, var(--blue-50))",
                borderRadius: "var(--radius-sm)",
              }}
            >
              {isSavingUser ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </button>
          </div>
        </form>
      </MyModal>
    </>
  );
}

export default User;
