import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import PemeriksaanComponent from "../../components/dashboard/PemeriksaaanComponent";

export default function JadwalKegiatanPages() {
  return (
    <>
      <PageMeta
        title="Pemeriksaan Pasien | Smart-PROLANIS"
        description=""
      />
      <PageBreadcrumb pageTitle="" />
      <div className="space-y-6">
        <ComponentCard title="">
          <PemeriksaanComponent />
        </ComponentCard>
      </div>
    </>
  );
}
