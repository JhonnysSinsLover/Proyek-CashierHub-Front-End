import { useState } from "react";
import {
  FaMoneyBillWave,
  FaTimes,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import { API_ENDPOINTS } from "../config/api";
import { useNotification } from "../hooks/useNotification";

export const PaymentModal = ({
  total,
  onClose,
  onSuccess,
  cartItems,
  onTransactionComplete,
}) => {
  const { showError: showErrorNotification, NotificationComponent } =
    useNotification();
  const [cashAmount, setCashAmount] = useState("");
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [change, setChange] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const handleCashChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setCashAmount(value);
    setShowError(false);
  };

  const handleConfirm = async () => {
    const cash = parseInt(cashAmount) || 0;

    if (cash < total) {
      setShowError(true);
      return;
    }

    const calculatedChange = cash - total;
    setChange(calculatedChange);

    // Save transaction to database
    setIsSaving(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const payload = {
        user_id: user?.id || 1,
        total_price: total,
        cash_amount: cash,
        // change_amount dihitung otomatis di backend
        items: cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.harga,
        })),
      };

      const response = await fetch(API_ENDPOINTS.TRANSACTIONS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menyimpan transaksi");
      }

      const result = await response.json();
      console.log("Transaction saved:", result);

      // Refresh products untuk update stok secara real-time
      if (onTransactionComplete) {
        await onTransactionComplete();
      }

      setShowSuccess(true);
    } catch (error) {
      console.error("Error saving transaction:", error);
      showErrorNotification(
        "Gagal menyimpan transaksi: " + error.message,
        "Transaksi Gagal"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onSuccess(parseInt(cashAmount), change);
    onClose();
  };

  // Success Modal
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
          <div className="bg-gradient-to-r from-[#5cb338] to-[#4d9a2e] p-6 text-white">
            <div className="flex items-center gap-3">
              <FaCheckCircle className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Pembayaran Berhasil!</h2>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-600 text-sm mb-1">Total Belanja</p>
                <p className="text-2xl font-bold text-gray-800">
                  Rp {total.toLocaleString("id-ID")},00
                </p>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-gray-600 text-sm mb-1">Uang Diterima</p>
                <p className="text-2xl font-bold text-[#1a509a]">
                  Rp {parseInt(cashAmount).toLocaleString("id-ID")},00
                </p>
              </div>

              <div className="bg-gradient-to-r from-[#5cb338] to-[#4d9a2e] rounded-xl p-4 text-white">
                <p className="text-sm mb-1 opacity-90">Kembalian</p>
                <p className="text-3xl font-black">
                  Rp {change.toLocaleString("id-ID")},00
                </p>
              </div>
            </div>

            <button
              onClick={handleSuccessClose}
              className="w-full bg-gradient-to-r from-[#1a509a] to-[#2d6bc4] text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all mt-6"
            >
              Selesai
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Payment Modal
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
        <div className="bg-gradient-to-r from-[#1a509a] to-[#2d6bc4] p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaMoneyBillWave className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Konfirmasi Pembayaran</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-gray-600 text-sm mb-1">Total Pembayaran</p>
            <p className="text-3xl font-black text-[#1a509a]">
              Rp {total.toLocaleString("id-ID")},00
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Jumlah Uang Tunai
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                Rp
              </span>
              <input
                type="text"
                value={
                  cashAmount ? parseInt(cashAmount).toLocaleString("id-ID") : ""
                }
                onChange={handleCashChange}
                placeholder="0"
                className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl outline-none text-lg font-semibold transition-all ${
                  showError
                    ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200"
                    : "border-gray-200 focus:border-[#1a509a] focus:ring-2 focus:ring-blue-100"
                }`}
                autoFocus
              />
            </div>

            {showError && (
              <div className="mt-3 bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg flex items-center gap-2 animate-shake">
                <FaExclamationCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-700 text-sm font-semibold">
                  Uang tidak cukup! Kurang Rp{" "}
                  {(total - (parseInt(cashAmount) || 0)).toLocaleString(
                    "id-ID"
                  )}
                  ,00
                </p>
              </div>
            )}

            {cashAmount && !showError && parseInt(cashAmount) >= total && (
              <div className="mt-3 bg-green-50 border-l-4 border-green-500 p-3 rounded-r-lg">
                <p className="text-green-700 text-sm font-semibold">
                  Kembalian: Rp{" "}
                  {(parseInt(cashAmount) - total).toLocaleString("id-ID")}
                  ,00
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 mb-6">
            {[10000, 20000, 50000, 100000, 200000, 500000].map((amount) => (
              <button
                key={amount}
                onClick={() => setCashAmount(amount.toString())}
                className="bg-gray-100 hover:bg-blue-50 border-2 border-gray-200 hover:border-[#1a509a] rounded-lg py-2 px-3 text-sm font-semibold text-gray-700 hover:text-[#1a509a] transition-all"
              >
                {amount >= 1000000
                  ? `${amount / 1000000}jt`
                  : `${amount / 1000}k`}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleConfirm}
              disabled={!cashAmount || isSaving}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                cashAmount && !isSaving
                  ? "bg-gradient-to-r from-[#5cb338] to-[#4d9a2e] text-white hover:shadow-lg"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isSaving ? "Menyimpan..." : "Konfirmasi"}
            </button>
          </div>
        </div>

        <NotificationComponent />
      </div>
    </div>
  );
};
