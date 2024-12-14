import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as tmImage from '@teachablemachine/image';
import './App.css';

//  Dasbor
const Dasbor = ({ prediksi, infoKelas }) => {
  const prediksiDiurutkan = [...prediksi].sort((a, b) => b.probability - a.probability);

  return (
    <div className="kontainer-dasbor">
      <div className="column-kontainer">

        <div className="kontainer-gambar">
          <img src="/image.png" alt="" />
        </div>
        <h1 className="judul-dasbor">Dasbor Prediksi</h1>
      </div>

      <div className="konten-dasbor">
        <div className="prediksi-teratas">
          <p className='text-hasil'>Hasil prediksi berdasarkan persentase</p>
          {prediksiDiurutkan.length > 0 && (
            <>
              <div className="detail-prediksi-teratas">
                <h4>{prediksiDiurutkan[0].className}</h4>
                <p>Tingkat klasifikasi: {(prediksiDiurutkan[0].probability * 100).toFixed(2)}%</p>
              </div>
            </>
          )}
        </div>

        <div className="detail-kelas">
          <h3>Informasi Kelas</h3>
          {prediksiDiurutkan.map((prediksi, indeks) => {
            const detailKelas = infoKelas.find(info => info.name === prediksi.className);
            return (
              <div key={indeks} className="item-kelas">
                <div>
                  <h4>{prediksi.className}</h4>
                  {detailKelas && (
                    <p>{detailKelas.description}</p>
                  )}
                </div>
                <span className="lencana-kepercayaan">
                  {(prediksi.probability * 100).toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Klasifikasi Gambar
const AplikasiKlasifikasiGambar = () => {
  const [tabAktif, setTabAktif] = useState('beranda');
  const [model, setModel] = useState(null);
  const [webcam, setWebcam] = useState(null);
  const [prediksi, setPrediksi] = useState([]);
  const [gambarSerupa, setGambarSerupa] = useState([]);
  const [gambarDiunggah, setGambarDiunggah] = useState(null);
  const [sedangMemuat, setSedangMemuat] = useState(false);

  // Informasi Kelas
  const infoKelas = [
    {
      name: 'Kelas',
      description: 'Rata rata hasil prediksi'
    },
  ];

  const referensiWebcam = useRef(null);
  const referensiGambarDiunggah = useRef(null);
  const referensiGambarSerupa = useRef(null);
  const referensiFrameAnimasi = useRef(null);

  const URL = "https://teachablemachine.withgoogle.com/models/rA-dHoodu/";

  // Memuat Model
  const muatModel = async () => {
    try {
      setSedangMemuat(true);
      const urlModel = URL + "model.json";
      const urlMetadata = URL + "metadata.json";
      const modelDimuat = await tmImage.load(urlModel, urlMetadata);
      setModel(modelDimuat);
    } catch (kesalahan) {
      console.error('Gagal memuat model:', kesalahan);
      alert('Gagal memuat model. Silakan periksa koneksi internet Anda.');
    } finally {
      setSedangMemuat(false);
    }
  };

  // Inisialisasi Webcam
  const inisialisasiWebcam = async () => {
    try {
      setSedangMemuat(true);
      const webcamBaru = new tmImage.Webcam(400, 400, true);
      await webcamBaru.setup();
      await webcamBaru.play();

      if (referensiWebcam.current) {
        referensiWebcam.current.innerHTML = '';
        referensiWebcam.current.appendChild(webcamBaru.canvas);
      }

      setWebcam(webcamBaru);
    } catch (kesalahan) {
      console.error('Gagal menginisialisasi webcam:', kesalahan);
      alert('Gagal mengakses webcam. Pastikan Anda telah memberikan izin.');
    } finally {
      setSedangMemuat(false);
    }
  };

  // Berhenti Webcam
  const berhentiWebcam = useCallback(() => {
    if (webcam) {
      webcam.stop();
      setWebcam(null);
      setPrediksi([]);

      if (referensiWebcam.current) {
        referensiWebcam.current.innerHTML = '';
      }
    }

    if (referensiFrameAnimasi.current) {
      window.cancelAnimationFrame(referensiFrameAnimasi.current);
      referensiFrameAnimasi.current = null;
    }
  }, [webcam]);

  // Prediksi Webcam
  const prediksiWebcam = useCallback(async () => {
    if (webcam && model && tabAktif === 'webcam') {
      webcam.update();
      const hasilPrediksi = await model.predict(webcam.canvas);
      setPrediksi(hasilPrediksi);

      referensiFrameAnimasi.current = window.requestAnimationFrame(prediksiWebcam);
    }
  }, [webcam, model, tabAktif]);

  // Effect untuk Prediksi Webcam
  useEffect(() => {
    if (webcam && model && tabAktif === 'webcam') {
      referensiFrameAnimasi.current = window.requestAnimationFrame(prediksiWebcam);
    } else {
      if (referensiFrameAnimasi.current) {
        window.cancelAnimationFrame(referensiFrameAnimasi.current);
        referensiFrameAnimasi.current = null;
        setPrediksi([]);
      }
    }

    return () => {
      if (referensiFrameAnimasi.current) {
        window.cancelAnimationFrame(referensiFrameAnimasi.current);
        referensiFrameAnimasi.current = null;
      }
    };
  }, [webcam, model, tabAktif, prediksiWebcam]);

  // Prediksi Gambar Diunggah
  const prediksiGambarDiunggah = async () => {
    if (!model || !referensiGambarDiunggah.current) return;

    try {
      setSedangMemuat(true);
      const hasilPrediksi = await model.predict(referensiGambarDiunggah.current);
      setPrediksi(hasilPrediksi);

      // Simulasi gambar serupa
      const gambarSerupa = [
        { url: '/placeholder1.jpg', confidence: Math.random() * 0.5 + 0.5 },
        { url: '/placeholder2.jpg', confidence: Math.random() * 0.5 + 0.5 },
        { url: '/placeholder3.jpg', confidence: Math.random() * 0.5 + 0.5 }
      ];

      setGambarSerupa(gambarSerupa);
    } catch (kesalahan) {
      console.error('Gagal memprediksi gambar:', kesalahan);
      alert('Gagal memprediksi gambar. Silakan coba lagi.');
    } finally {
      setSedangMemuat(false);
    }
  };

  // Menangani Unggah Gambar
  const tanganiUnggahGambar = (e) => {
    const berkas = e.target.files[0];
    if (berkas) {
      const pembaca = new FileReader();
      pembaca.onload = (event) => {
        setGambarDiunggah(event.target.result);
        setTimeout(prediksiGambarDiunggah, 100);
      };
      pembaca.readAsDataURL(berkas);
    }
  };


  useEffect(() => {
    muatModel();
  }, []);

  // Effect untuk Pergantian Tab
  useEffect(() => {
    if (tabAktif !== 'webcam') {
      berhentiWebcam();
    }

    if (tabAktif === 'unggah') {
      setPrediksi([]);
      setGambarSerupa([]);
      setGambarDiunggah(null);
    }
  }, [tabAktif, berhentiWebcam]);

  return (
    <div className="kontainer-klasifikasi">
      <div className="navigasi-tab">
        <button
          className={`tombol-tab ${tabAktif === 'beranda' ? 'aktif' : ''}`}
          onClick={() => setTabAktif('beranda')}
        >
          Beranda
        </button>
        <button
          className={`tombol-tab ${tabAktif === 'webcam' ? 'aktif' : ''}`}
          onClick={() => setTabAktif('webcam')}
        >
          Webcam
        </button>
        <button
          className={`tombol-tab ${tabAktif === 'unggah' ? 'aktif' : ''}`}
          onClick={() => setTabAktif('unggah')}
        >
          Unggah Gambar
        </button>
      </div>

      {tabAktif === 'beranda' && (
        <Dasbor
          prediksi={prediksi}
          infoKelas={infoKelas}
        />
      )}

      {tabAktif === 'webcam' && (
        <div className="bagian-webcam">
          <div className='row-webcam-tombol'>
            <button
              onClick={inisialisasiWebcam}
              disabled={sedangMemuat || !model || webcam}
              className="tombol-mulai-kamera"
            >
              {sedangMemuat ? 'Memuat...' : 'Aktifkan Kamera'}
            </button>
            <button
              onClick={berhentiWebcam}
              disabled={!webcam}
              className="tombol-berhenti-kamera"
            >
              Nonaktifkan Kamera
            </button>
          </div>

          <div ref={referensiWebcam} className="kontainer-webcam" />
        </div>
      )}

      {tabAktif === 'unggah' && (
        <div className="bagian-unggah">
          <input
            type="file"
            accept="image/*"
            onChange={tanganiUnggahGambar}
            disabled={sedangMemuat || !model}
            className="input-berkas"
          />

          {gambarDiunggah && (
            <div className="kontainer-gambar-diunggah">
              <img
                ref={referensiGambarDiunggah}
                src={gambarDiunggah}
                alt="Gambar Diunggah"
                className="gambar-diunggah"
              />
            </div>
          )}

          {gambarSerupa.length > 0 && (
            <div className="bagian-gambar-serupa">
              <h3>Gambar Serupa</h3>
              <div ref={referensiGambarSerupa} className="kisi-gambar-serupa">
                {gambarSerupa.map((gambar, indeks) => (
                  <div key={indeks} className="item-gambar-serupa">
                    <img
                      src={gambar.url}
                      alt={`Serupa ${indeks}`}
                      className="gambar-serupa"
                    />
                    <div className="kepercayaan-gambar-serupa">
                      Kemiripan: {(gambar.confidence * 100).toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bagian-prediksi">
        <h3>Hasil Prediksi</h3>
        {prediksi.map((p, indeks) => {
          const persentase = (p.probability * 100).toFixed(2);
          return (
            <div key={indeks} className="item-prediksi">
              <div className="label-prediksi">{p.className}</div>
              <div className="batang-prediksi">
                <div
                  className="pengisi-batang-prediksi"
                  style={{
                    width: `${persentase}%`,
                    backgroundColor: persentase > 50 ? '#2ecc71' : '#3498db'
                  }}
                >
                  {persentase}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AplikasiKlasifikasiGambar;