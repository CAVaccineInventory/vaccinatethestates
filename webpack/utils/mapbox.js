export const createVaccineFilter = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const filterPfizer = !!urlParams.get("pfizer");
    const filterJJ = !!urlParams.get("jj");
    const filterModerna = !!urlParams.get("moderna");
    let filter = undefined;
    if (filterPfizer || filterJJ || filterModerna) {
      filter = ["all"];
      if (filterPfizer) {
          filter.push(["==", ["get", "vaccine_pfizer"], true]);
      }
      if (filterJJ) {
          filter.push(["==", ["get", "vaccine_jj"], true]);
      }
      if (filterModerna) {
          filter.push(["==", ["get", "vaccine_moderna"], true]);
      }
    }
    return filter;
}