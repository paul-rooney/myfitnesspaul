import { Cluster, Grid, Icon, Stack } from "../../../primitives";
import Button from "../../Common/Button";
import Card from "../../Common/Card";
import styles from "./meal-plan.module.css";

const MealPlan = ({ mealPlan, updateMealPlan, lockMeal, minKcal, maxKcal, minProtein, maxProtein }) => (
    <Grid>
        {mealPlan.length > 0
            ? mealPlan.map((day, dayIndex) => (
                  <Card padding="var(--size-2)" key={dayIndex}>
                      <Stack space="var(--size-3)" style={{ fontSize: "var(--font-size-0)" }} key={dayIndex}>
                          <Cluster justify="space-between" align="baseline">
                              <Stack space="0">
                                  <h3 className={styles.dayHeading}>Day {dayIndex + 1}</h3>
                                  <Cluster className={styles.dailyTotals}>
                                      <Stack>
                                          <span className={styles.label}>Total kcal:</span>
                                          {day.reduce((acc, meal) => meal.kcal + acc, 0)}
                                      </Stack>
                                      <Stack>
                                          <span className={styles.label}>Total protein:</span>
                                          {day.reduce((acc, meal) => meal.protein + acc, 0)}
                                      </Stack>
                                  </Cluster>
                              </Stack>
                              <Button variant="round" clickHandler={() => updateMealPlan(dayIndex, [minKcal, maxKcal], [minProtein, maxProtein], 1)}>
                                  <Icon label="Update" direction="ltr" icon="refresh-cw" />
                              </Button>
                          </Cluster>

                          {day.map((meal, mealIndex) => (
                              <Cluster justify="space-between" align="baseline" className={styles.meal} data-locked={meal.is_locked} key={`${meal.id}-${dayIndex}`}>
                                  <Stack space="var(--size-1)">
                                      <span className={styles.displayName}>{meal.display_name}</span>
                                      <Cluster>
                                          <Stack>
                                              <span className={styles.label}>kcal:</span>
                                              {meal.kcal}
                                          </Stack>
                                          <Stack>
                                              <span className={styles.label}>Protein:</span>
                                              {meal.protein}
                                          </Stack>
                                      </Cluster>
                                  </Stack>
                                  <Button variant="round" clickHandler={() => lockMeal(dayIndex, mealIndex)}>
                                      <Icon label="Lock" icon={meal?.is_locked ? "lock" : "unlock"} />
                                  </Button>
                              </Cluster>
                          ))}
                      </Stack>
                  </Card>
              ))
            : null}
    </Grid>
);

export default MealPlan;
