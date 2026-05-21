const config = {
  // บอก React ว่า: ถ้ามีตัวแปรบน Cloud ให้ใช้บน Cloud ถ้าไม่มีให้ใช้ localhost  จุด 1
  apiPath: process.env.REACT_APP_API_URL || "http://localhost:3000",
  headers: () => {
    return {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    };
  },
};
export default config;
