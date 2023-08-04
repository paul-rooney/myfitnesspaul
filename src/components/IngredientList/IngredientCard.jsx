import Card from "../Common/Card";

const IngredientCard = () => {
    <Card>
        {/* <details className={styles.details}>
            <summary className={styles.summary}>
                <header className={styles.header}>
                    <Stack space="0">
                        {brand_name && <span className={styles.brandName}>{brand_name}</span>}
                        <span className={styles.displayName}>{display_name}</span>
                    </Stack>
                    <Cluster space="var(--size-1)">
                        <Button variant="round" data-id={id} data-operation="update" clickHandler={clickHandler}>
                            <Icon icon="edit-3" />
                        </Button>
                        <Button variant="round" data-id={id} data-operation="delete" clickHandler={clickHandler}>
                            <Icon icon="trash-2" />
                        </Button>
                    </Cluster>
                </header>
            </summary>
            <MacronutrientValues kcal={kcal} c={carbohydrate} f={fat} p={protein} unit={avg_unit_weight} />
        </details> */}
    </Card>;
};

export default IngredientCard;
