import usePagination from "../../../hooks/usePagination";
import { Cluster, Icon } from "../../../primitives";
import Button from "../Button";

const Paginator = ({ arrayToPaginate, itemsPerPage, setStartIndex, setEndIndex }) => {
    const totalPages = Math.ceil(arrayToPaginate.length / itemsPerPage);
    const { currentPage, goToPage, nextPage, previousPage } = usePagination(totalPages);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    setStartIndex(start);
    setEndIndex(end);

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
            <span style={{ fontSize: "var(--font-size-0)", minInlineSize: "3em", textAlign: "center" }}>{currentPage}</span>
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
