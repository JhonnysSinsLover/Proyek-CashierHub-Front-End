import { useState, useEffect } from "react";
import { Modal } from "./Modal";
import {
  FaBox,
  FaBarcode,
  FaDollarSign,
  FaCubes,
  FaCamera,
  FaTags,
  FaChevronDown,
  FaLightbulb,
} from "react-icons/fa";
import { ScanQRModal } from "./ScanQRModal";
import { API_ENDPOINTS } from "../config/api";

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
    jenisCustom: "",
    kode: "",
    stok: "",
    harga: "",
  };
};

export const ProductModal = ({ onClose, onSave, product = null }) => {
  const [formData, setFormData] = useState(() => getInitialFormData(product));
  const [errors, setErrors] = useState({});
  const [showScanQRModal, setShowScanQRModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.CATEGORIES);
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nama.trim()) newErrors.nama = "Nama barang harus diisi";

    // Validasi jenis: jika __new__ maka cek jenisCustom
    if (!formData.jenis || formData.jenis.trim() === "") {
      newErrors.jenis = "Kategori harus dipilih";
    } else if (
      formData.jenis === "__new__" &&
      (!formData.jenisCustom || formData.jenisCustom.trim() === "")
    ) {
      newErrors.jenis = "Nama kategori baru harus diisi";
    }

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
        // Jika pilih kategori baru (__new__), gunakan jenisCustom
        jenis:
          formData.jenis === "__new__" ? formData.jenisCustom : formData.jenis,
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
      jenisCustom: "",
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

        {/* Jenis (Category) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <FaTags className="inline mr-2 text-[#1a509a]" />
            Jenis/Kategori
          </label>
          {isLoadingCategories ? (
            <div className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-500 flex items-center">
              <svg
                className="animate-spin h-4 w-4 mr-2 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Memuat kategori...
            </div>
          ) : (
            <div className="relative">
              <select
                name="jenis"
                value={formData.jenis}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 pr-10 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a509a] transition-all appearance-none bg-white cursor-pointer ${
                  errors.jenis ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">-- Pilih Kategori --</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
                <option
                  value="__new__"
                  className="font-semibold text-[#5cb338]"
                >
                  + Tambah Kategori Baru
                </option>
              </select>
              <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          )}
          {errors.jenis && (
            <p className="text-red-500 text-sm mt-1">{errors.jenis}</p>
          )}
          {formData.jenis === "__new__" && (
            <div className="mt-2 animate-fadeIn">
              <input
                type="text"
                name="jenisCustom"
                value={formData.jenisCustom || ""}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-[#5cb338] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5cb338] transition-all"
                placeholder="Ketik nama kategori baru"
                autoFocus
              />
              <p className="text-xs text-[#5cb338] mt-1 flex items-center gap-1">
                <FaLightbulb className="text-[#5cb338]" />
                <span>Kategori baru akan otomatis tersimpan</span>
              </p>
            </div>
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
