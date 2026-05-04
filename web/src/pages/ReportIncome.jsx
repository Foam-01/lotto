import Home from "./Home";

function ReportIncome() {
  return (
    <>
      <Home>
        <div className="h4">รายงารายได้</div>
        <div className="mt-3">
          <div className="alert-secondary">
            <div className="row">
              <div className="col-md-3">
                <div className="form-group">
                  <label>วันที่</label>
                  <input type="date" className="form-control" />
                </div>
              </div>

              <div className="col-md-3">
                <div className="form-group">
                  <label>ถึงวันที่</label>
                  <input type="date" className="form-control" />
                </div>
              </div>

              <div className="col-md-2">
                <label></label>
                <button className="btn btn-primary mt-4">
                  <i className="bi bi-search"></i>
                  ค้นหา
                </button>
              </div>
            </div>
          </div>
        </div>
      </Home>
    </>
  );
}

export default ReportIncome;
