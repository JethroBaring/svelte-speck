export const useModal = () => {
  let isOpen = $state({ value: false });

  return {
    isOpen,
    openModal() {
      isOpen.value = true;
    },
    closeModal() {
      isOpen.value = false;
    }
  };
}