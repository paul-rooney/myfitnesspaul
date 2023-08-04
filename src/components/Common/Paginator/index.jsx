import { useEffect, useState } from "react";
import usePagination from "../../../hooks/usePagination";
import { Cluster, Icon } from "../../../primitives";
import Button from "../Button";
import styles from "./paginator.module.css";

const getPageCount = (arr, perPage) => {
    return Math.ceil(arr.length / perPage);
};

const Paginator = ({ arrayToPaginate, itemsPerPage = 10, setStartIndex, setEndIndex }) => {
    const totalPages = getPageCount(arrayToPaginate, itemsPerPage);
    const { currentPage, goToPage, nextPage, previousPage } = usePagination(totalPages);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    useEffect(() => {
        setStartIndex(startIndex);
        setEndIndex(endIndex);
    }, [currentPage]);
    
    useEffect(() => {
        goToPage(1);
    }, [arrayToPaginate]);

    return (
        <Cluster justify="center" align="baseline" space="var(--size-1)">
            <Button disabled={currentPage === 1} clickHandler={() => goToPage(1)}>
                <Icon space="0.5ch" direction="ltr" icon="chevrons-left">
                    First
                </Icon>
            </Button>
            <Button disabled={currentPage === 1} clickHandler={previousPage}>
                <Icon space="0.5ch" direction="ltr" icon="chevron-left">
                    Previous
                </Icon>
            </Button>
            <span className={styles.currentPage}>{currentPage}</span>
            <Button disabled={currentPage === totalPages} clickHandler={nextPage}>
                <Icon space="0.5ch" icon="chevron-right">
                    Next
                </Icon>
            </Button>
            <Button disabled={currentPage === totalPages} clickHandler={() => goToPage(totalPages)}>
                <Icon space="0.5ch" icon="chevrons-right">
                    Last
                </Icon>
            </Button>
        </Cluster>
    );
};

export default Paginator;
