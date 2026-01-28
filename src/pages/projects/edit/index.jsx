import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL } from './../../../../config';
import { getToken } from './../../../../auth';
import { useLocale } from "../../../contexts/LocaleContext";

function EditProject() {
  const { t } = useLocale();
  const { id } = useParams();
  const navigate = useNavigate();
  const token = getToken();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [lotCount, setLotCount] = useState(0);
  const [pricePerSquareUnit, setPricePerSquareUnit] = useState(0);
  const [measurementUnit, setMeasurementUnit] = useState("m2");
  const [interestRate, setInterestRate] = useState(0);
  const [commissionRate, setCommissionRate] = useState(0);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [projectType, setProjectType] = useState("residential");
  const [availableLots, setAvailableLots] = useState(0);
  const [reservedLots, setReservedLots] = useState(0);
  const [soldLots, setSoldLots] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingProject, setLoadingProject] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      setLoadingProject(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/api/v1/projects/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(t('projects.failedToLoadProject'));
        const data = await res.json();
        setName(data.name || "");
        setDescription(data.description || "");
        setAddress(data.address || "");
        setLotCount(data.lot_count || 0);
        setPricePerSquareUnit(data.price_per_square_unit || 0);
        setMeasurementUnit(data.measurement_unit || "m2");
        setInterestRate(data.interest_rate || 0);
        setCommissionRate(data.commission_rate || 0);
        setDeliveryDate(data.delivery_date || "");
        setProjectType(data.project_type || "residential");
        setAvailableLots(data.available_lots || 0);
        setReservedLots(data.reserved_lots || 0);
        setSoldLots(data.sold_lots || 0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingProject(false);
      }
    };

    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/projects/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          project: {
            name,
            description,
            address,
            lot_count: Number(lotCount),
            price_per_square_unit: Number(pricePerSquareUnit),
            measurement_unit: measurementUnit,
            interest_rate: Number(interestRate),
            commission_rate: Number(commissionRate),
            delivery_date: deliveryDate || null,
            project_type: projectType,
          }
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || t('projects.errorUpdatingProject'));
      }

      navigate("/projects");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingProject) {
    return <main className="w-full xl:px-[48px] px-6 pb-6 sm:pt-[156px] pt-[100px]">{t('projects.loadingProject')}</main>;
  }

  return (
    <main className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] sm:pt-[156px] pt-[100px]">
      <div className="max-w-2xl mx-auto bg-white dark:bg-darkblack-600 p-8 rounded-lg">
        <h2 className="text-2xl font-bold text-bgray-900 dark:text-white mb-6">{t('projects.editProject')}</h2>


        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Lots Stats - Read Only */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-bgray-100 dark:bg-darkblack-500 p-4 rounded-lg text-center">
            <span className="block text-xs text-bgray-600 dark:text-bgray-400 uppercase font-bold">{t('projects.availableLots')}</span>
            <span className="text-xl font-bold text-success-300">{availableLots}</span>
          </div>
          <div className="bg-bgray-100 dark:bg-darkblack-500 p-4 rounded-lg text-center">
            <span className="block text-xs text-bgray-600 dark:text-bgray-400 uppercase font-bold">{t('projects.reservedLots')}</span>
            <span className="text-xl font-bold text-yellow-500">{reservedLots}</span>
          </div>
          <div className="bg-bgray-100 dark:bg-darkblack-500 p-4 rounded-lg text-center">
            <span className="block text-xs text-bgray-600 dark:text-bgray-400 uppercase font-bold">{t('projects.soldLots')}</span>
            <span className="text-xl font-bold text-red-500">{soldLots}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6 grid md:grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">{t('projects.name')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
                placeholder={t('projects.enterProjectName')}
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">{t('projects.projectType')}</label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
              >
                <option value="residential">{t('projects.residential')}</option>
                <option value="commercial">{t('projects.commercial')}</option>
                <option value="industrial">{t('projects.industrial')}</option>
                <option value="mixed_use">{t('projects.mixedUse')}</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">{t('projects.description')}</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
              placeholder={t('projects.enterDescription')}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">{t('projects.address')}</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
              placeholder={t('projects.enterAddress')}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">{t('projects.deliveryDate')}</label>
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
              placeholder={t('projects.enterDeliveryDate')}
            />
          </div>

          <div className="mb-6 grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">{t('projects.lotsCount')}</label>
              <input
                type="number"
                value={lotCount}
                onChange={(e) => setLotCount(Number(e.target.value))}
                required
                className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
                placeholder={t('projects.enterLotsCount')}
              />
            </div>

            {/* Measurement Unit */}
            <div>
              <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">
                {t('projects.measurementUnit')}
              </label>
              <select
                value={measurementUnit}
                onChange={(e) => setMeasurementUnit(e.target.value)}
                className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
              >
                <option value="m2">{t('projects.squareMeters')}</option>
                <option value="ft2">{t('projects.squareFeet')}</option>
                <option value="vara2">{t('projects.squareVaras')}</option>
              </select>
            </div>
          </div>

          {/* Precio por Unidad */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">
              {t('projects.pricePerUnit')} ({measurementUnit === 'm2' ? t('projects.squareMeters') : measurementUnit === 'ft2' ? t('projects.squareFeet') : t('projects.squareVaras')})
            </label>
            <input
              type="number"
              value={pricePerSquareUnit}
              onChange={(e) => setPricePerSquareUnit(e.target.value)}
              required
              className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
              placeholder={t('projects.enterPricePerUnit')}
            />
          </div>

          <div className="mb-6 grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">{t('projects.interestRate')}</label>
              <input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                required
                className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
                placeholder={t('projects.enterInterestRate')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">{t('projects.commissionRate')}</label>
              <input
                type="number"
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                required
                className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
                placeholder={t('projects.enterCommissionRate')}
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-gray-500 hover:bg-gray-600 text-white mt-4 py-3.5 px-4 rounded-lg"
            >
              {t('common.back')}
            </button>
            <button
              type="submit"
              className="bg-success-300 hover:bg-success-400 text-white font-bold mt-4 py-3.5 px-4 rounded-lg"
              disabled={loading}
            >
              {loading ? t('projects.saving') : t('projects.saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default EditProject;