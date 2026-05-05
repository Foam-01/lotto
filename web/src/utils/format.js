// src/utils/format.js

// 🌟 1. ฟังก์ชันแปลงวันที่
export const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// 🌟 2. ฟังก์ชันแปลงเวลา
export const formatTime = (timeString) => {
  if (!timeString) return "-";
  return timeString.substring(0, 5) + " น.";
};

// 🌟 3. ฟังก์ชันรวมวันที่และเวลา (สำหรับหน้าบิล)
export const formatDateTime = (dateString, timeString) => {
  if (!dateString) return "-";
  const datePart = formatDate(dateString);
  const timePart = timeString ? ` ${timeString.substring(0, 5)} น.` : "";
  return `${datePart}${timePart}`;
};
