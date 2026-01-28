import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from './../../../../config';
import { getToken } from './../../../../auth';
import { useLocale } from "../../../contexts/LocaleContext";

function CreateProject() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [lotCount, setLotCount] = useState(0);
  const [pricePerSquareUnit, setPricePerSquareUnit] = useState(0); // renamed
  const [measurementUnit, setMeasurementUnit] = useState("m2");    // new
  const [interestRate, setInterestRate] = useState(0);
  const [commissionRate, setCommissionRate] = useState(0);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [projectType, setProjectType] = useState("residential");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = getToken();
  const { t } = useLocale();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/v1/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          project: {   // nested per strong params
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

      if (response.ok) {
        navigate('/projects');
      } else {
        console.warn('Error al crear el proyecto');
      }
    } catch (error) {
      console.error('Error al conectar con el servidor', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <main className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] sm:pt-[156px] pt-[100px]">
      <div className="max-w-2xl mx-auto bg-white dark:bg-darkblack-600 p-8 rounded-lg">
        <h2 className="text-2xl font-bold text-bgray-900 dark:text-white mb-6">
          {t('projects.createNewProject')}
        </h2>
        <form onSubmit={handleSubmit}>
          {/* Project Name */}
          <div className="mb-6 grid md:grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">
                {t('projects.name')}
              </label>
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
              <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">
                {t('projects.projectType')}
              </label>
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

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">
              {t('projects.description')}
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
              placeholder={t('projects.enterDescription')}
            />
          </div>

          {/* Address */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">
              {t('projects.address')}
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
              placeholder={t('projects.enterAddress')}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">
              {t('projects.deliveryDate')}
            </label>
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
              placeholder={t('projects.enterDeliveryDate')}
            />
          </div>

          {/* Lot Count */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">
              {t('projects.lotsCount')}
            </label>
            <input
              type="number"
              value={lotCount}
              onChange={(e) => setLotCount(e.target.value)}
              required
              className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
              placeholder={t('projects.enterLotsCount')}
            />
          </div>

          {/* Measurement Unit */}
          <div className="mb-6">
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

          {/* Interest Rate */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">
              {t('projects.interestRate')}
            </label>
            <input
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              required
              className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
              placeholder={t('projects.enterInterestRate')}
            />
          </div>

          {/* Commission Rate */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">
              {t('projects.commissionRate')}
            </label>
            <input
              type="number"
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
              required
              className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
              placeholder={t('projects.enterCommissionRate')}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={handleBack}
              className="bg-gray-500 hover:bg-gray-600 text-white mt-10 py-3.5 px-4 rounded-lg"
            >
              {t('common.back')}
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold mt-10 py-3.5 px-4 rounded-lg"
              disabled={loading}
            >
              {loading ? t('projects.creating') : t('projects.createProject')}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default CreateProject;