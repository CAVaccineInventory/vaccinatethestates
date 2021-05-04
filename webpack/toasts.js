import toast from "./templates/toast.handlebars";

let toastTimerId = null;
export const showToast = (toastText) => {
    const container = document.getElementById("toast-container");
    if (toastTimerId) {
        clearTimeout(toastTimerId);
    }
    container.innerHTML = toast({
        toastText
    });
    toastTimerId = setTimeout(() => {
        container.innerHTML = "";
    }, 3000);
}