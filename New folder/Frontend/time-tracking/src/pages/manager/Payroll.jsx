import { useState, useEffect } from "react";
import payrollApi from "../../api/payrollApi";
import { toast } from "react-toastify";

export default function Payroll() {
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dates, setDates] = useState({
        start: new Date().toISOString().slice(0, 10),
        end: new Date().toISOString().slice(0, 10)
    });

    const fetchHistory = async () => {
        try {
            const res = await payrollApi.getAll();
            setPayrolls(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleGenerate = async () => {
        if (!window.confirm("Generate payroll for selected dates?")) return;

        try {
            await payrollApi.generate({ startDate: dates.start, endDate: dates.end });
            toast.success("Payroll generated successfully!");
            fetchHistory();
        } catch (err) {
            toast.error("Failed to generate payroll.");
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Payroll Management</h1>

            {/* GENERATOR CARD */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h2 className="text-lg font-semibold mb-4 text-gray-700">Generate New Payroll</h2>
                <div className="flex gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Start Date</label>
                        <input
                            type="date"
                            className="border p-2 rounded"
                            value={dates.start}
                            onChange={e => setDates({ ...dates, start: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">End Date</label>
                        <input
                            type="date"
                            className="border p-2 rounded"
                            value={dates.end}
                            onChange={e => setDates({ ...dates, end: e.target.value })}
                        />
                    </div>
                    <button
                        onClick={handleGenerate}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium"
                    >
                        Calculate & Generate
                    </button>
                </div>
            </div>

            {/* HISTORY TABLE */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full text-left">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="px-4 py-3 font-semibold text-gray-600">Employee</th>
                            <th className="px-4 py-3 font-semibold text-gray-600">Period</th>
                            <th className="px-4 py-3 font-semibold text-gray-600">Hours</th>
                            <th className="px-4 py-3 font-semibold text-gray-600">Rate</th>
                            <th className="px-4 py-3 font-semibold text-gray-600">Gross Pay</th>
                            <th className="px-4 py-3 font-semibold text-gray-600">Generated At</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {payrolls.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-900">{p.employee?.fullName || "Unknown"}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    {new Date(p.periodStart).toLocaleDateString()} - {new Date(p.periodEnd).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">{p.totalHours.toFixed(2)}</td>
                                <td className="px-4 py-3">${p.hourlyRate.toFixed(2)}</td>
                                <td className="px-4 py-3 font-bold text-green-700">${p.grossPay.toFixed(2)}</td>
                                <td className="px-4 py-3 text-sm text-gray-400">
                                    {new Date(p.generatedAt).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                        {payrolls.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">No payroll records found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
