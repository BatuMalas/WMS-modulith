import api from "./api";

const DashboardService = {
    // Get dashboard data
    getSummary: () => api.get("/dashboard"),
};

export default DashboardService;
