import logo from "./logo.svg";
import "./App.css";
import axios from "axios";

function App() {
  const api = "http://localhost:3000/"; // เติม / ปิดท้าย
  const handleGet = async () => {
    await axios
      .get(api + "api/app") // แก้ให้ตรงกับ @Controller ใน Backend
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log("Error:", err);
      });
  };

  const handlePost = async () => {
    await axios
      .post(api + "api/app", { name: "new record" })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log("Error:", err);
      });
  };

  const handlePut = async () => {
    await axios.put(api + 'api/app/2', { name: 'update edit'}).then(res => {
      console.log(res.data);
    }).catch(err => {
      console.log('Error:', err);
    });
  };

  const handleDelete = async () => {
    await axios.delete(api + 'api/app/3').then(res => {
      console.log(res.data);
    }).catch(err => {
      console.log('Error:', err);
    });
  };
  return (
    <div className="App">
      <div>
        <h3>Connect API</h3>

        <button onClick={handleGet}>GET</button>

        <button onClick={handlePost}>POST</button>

        <button onClick={handlePut}>PUT</button>

        <button onClick={handleDelete}>DELETE</button>
      </div>
    </div>
  );
}

export default App;
