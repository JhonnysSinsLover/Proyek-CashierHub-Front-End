import { useState } from "react";
import { Modal } from "./Modal";
import {
  FaBox,
  FaBarcode,
  FaDollarSign,
  FaCubes,
  FaCamera,
} from "react-icons/fa";
import { ScanQRModal } from "./ScanQRModal";

const getInitialFormData = (product) => {
  if (product) {
    // Format harga untuk display saat edit
    const formatHargaForDisplay = (price) => {
      if (!price) return "";
      const priceStr = price.toString();
      return priceStr.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    };

    return {
      nama: product.nama || "",
      jenis: product.jenis || "",
      kode: product.kode || "",
      stok: product.stok?.toString() || "",
      harga: formatHargaForDisplay(product.harga),
    };
  }
  return {
    nama: "",
    jenis: "",
    kode: "",
    stok: "",
    harga: "",
  };
};

export const ProductModal = ({ onClose, onSave, product = null }) => {
  const [formData, setFormData] = useState(() => getInitialFormData(product));
  const [errors, setErrors] = useState({});
  const [showScanQRModal, setShowScanQRModal] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nama.trim()) newErrors.nama = "Nama barang harus diisi";
    if (!formData.jenis.trim()) newErrors.jenis = "jenis harus diisi";
    if (!formData.kode.trim()) newErrors.kode = "Kode barang harus diisi";
    if (!formData.stok || formData.stok < 0)
      newErrors.stok = "Stok harus berupa angka positif";

    // Validasi harga - parse dulu dari format dengan titik
    const numericHarga = parseHarga(formData.harga || "");
    if (!numericHarga || parseInt(numericHarga) <= 0)
      newErrors.harga = "Harga harus berupa angka positif";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const productData = {
        ...formData,
        stok: parseInt(formData.stok),
        harga: Number(parseHarga(formData.harga)),
      };

      if (product) {
        productData.id = product.id;
      }

      onSave(productData);
      handleClose();
    }
  };

  // Format harga dengan pemisah ribuan
  const formatHarga = (value) => {
    // Hapus semua karakter non-digit
    const numericValue = value.replace(/\D/g, "");

    // Jika kosong, return empty string
    if (numericValue === "") return "";

    // Format dengan pemisah ribuan (titik)
    return numericValue.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
  };

  // Parse harga dari format display ke numeric
  const parseHarga = (formattedValue) => {
    return formattedValue.replace(/\./g, "");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Khusus untuk harga, format dengan pemisah ribuan
    if (name === "harga") {
      const formatted = formatHarga(value);
      setFormData((prev) => ({
        ...prev,
        [name]: formatted,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle scan QR success untuk kode barang
  const handleScanSuccess = (decodedText) => {
    setFormData((prev) => ({
      ...prev,
      kode: decodedText,
    }));
    setShowScanQRModal(false);

    // Clear error if exists
    if (errors.kode) {
      setErrors((prev) => ({
        ...prev,
        kode: "",
      }));
    }
  };

  const handleClose = () => {
    setFormData({
      nama: "",
      jenis: "",
      kode: "",
      stok: "",
      harga: "",
    });
    setErrors({});
    onClose();
  };

  const modalTitle = product ? "Edit Barang" : "Tambah Barang Baru";
  const submitButtonText = product ? "Simpan Perubahan" : "Tambah Barang";

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={modalTitle}
      size="md"
      footer={
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
          >
            Batal
          </button>
          <button
            type="submit"
            form="product-form"
            className="px-5 py-2.5 bg-gradient-to-r from-[#5cb338] to-[#4d9a2e] text-white rounded-lg hover:shadow-lg transition-all font-semibold"
          >
            {submitButtonText}
          </button>
        </div>
      }
    >
      <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Nama Barang */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <FaBox className="inline mr-2 text-[#1a509a]" />
            Nama Barang
          </label>
          <input
            type="text"
            name="nama"
            value={formData.nama}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a509a] transition-all ${
              errors.nama ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Masukkan nama barang"
          />
          {errors.nama && (
            <p className="text-red-500 text-sm mt-1">{errors.nama}</p>
          )}
        </div>

        {/* jenis */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <FaBox className="inline mr-2 text-[#1a509a]" />
            jenis
          </label>
          <input
            type="text"
            name="jenis"
            value={formData.jenis}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a509a] transition-all ${
              errors.jenis ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Masukkan jenis barang"
          />
          {errors.jenis && (
            <p className="text-red-500 text-sm mt-1">{errors.jenis}</p>
          )}
        </div>

        {/* Kode Barang */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <FaBarcode className="inline mr-2 text-[#1a509a]" />
            Kode Barang
          </label>
          <div className="relative">
            <input
              type="text"
              name="kode"
              value={formData.kode}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 pr-12 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a509a] transition-all ${
                errors.kode ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Masukkan kode barang"
            />
            <button
              type="button"
              onClick={() => setShowScanQRModal(true)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-[#5cb338] to-[#4d9a2e] text-white p-2 rounded-lg hover:shadow-md transition-all"
              title="Scan QR/Barcode"
            >
              <FaCamera className="w-4 h-4" />
            </button>
          </div>
          {errors.kode && (
            <p className="text-red-500 text-sm mt-1">{errors.kode}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Stok */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaCubes className="inline mr-2 text-[#1a509a]" />
              Stok
            </label>
            <input
              type="number"
              name="stok"
              value={formData.stok}
              onChange={handleChange}
              min="0"
              className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a509a] transition-all ${
                errors.stok ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="0"
            />
            {errors.stok && (
              <p className="text-red-500 text-sm mt-1">{errors.stok}</p>
            )}
          </div>

          {/* Harga */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaDollarSign className="inline mr-2 text-[#1a509a]" />
              Harga (Rp.)
            </label>
            <input
              type="text"
              name="harga"
              value={formData.harga}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a509a] transition-all ${
                errors.harga ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Contoh: 10.000"
            />
            {errors.harga && (
              <p className="text-red-500 text-sm mt-1">{errors.harga}</p>
            )}
          </div>
        </div>
      </form>

      {showScanQRModal && (
        <ScanQRModal
          onClose={() => setShowScanQRModal(false)}
          onScanSuccess={handleScanSuccess}
        />
      )}
    </Modal>
  );
};
