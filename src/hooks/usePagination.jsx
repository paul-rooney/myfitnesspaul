import { useState } from "react";

const usePagination = (totalPages, initialPage = 1) => {
    const [currentPage, setCurrentPage] = useState(initialPage);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prevPage) => prevPage + 1);
        }
    };

    const previousPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prevPage) => prevPage - 1);
        }
    };

    return {
        currentPage,
        goToPage,
        nextPage,
        previousPage,
    };
};

export default usePagination;
