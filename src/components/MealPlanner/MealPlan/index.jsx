import { Cluster, Grid, Icon, Stack } from "../../../primitives";
import Button from "../../Common/Button";

const MealPlan = ({ mealPlan, updateMealPlan, lockMeal, minKcal, maxKcal, minProtein, maxProtein }) => (
    <Grid min="150px">
        {mealPlan.length > 0
            ? mealPlan.map((day, dayIndex) => (
                  <Stack space="var(--size-2)" style={{ fontSize: "var(--font-size-0)" }} key={dayIndex}>
                      <Cluster justify="space-between" align="baseline">
                          <h3>Day {dayIndex + 1}</h3>
                          <Button clickHandler={() => updateMealPlan(dayIndex, [minKcal, maxKcal], [minProtein, maxProtein], 1)}>
                              <Icon direction="ltr" icon="refresh-cw" />
                          </Button>
                      </Cluster>
                      {day.map((meal, mealIndex) => (
                          <button key={`${meal.id}-${dayIndex}`} type="button" onClick={() => lockMeal(dayIndex, mealIndex)} style={meal?.is_locked ? { backgroundColor: "blue" } : {}}>
                              <Stack space="var(--size-1)">
                                  <span style={{ color: "var(--blue-10)", fontWeight: "600" }}>{meal.display_name}</span>
                                  <Cluster>
                                      <span>kcal: {meal.kcal}</span>

                                      <span>Protein: {meal.protein}</span>
                                  </Cluster>
                              </Stack>
                          </button>
                      ))}
                      <Cluster>
                          <Stack>
                              <span>Total kcal:</span>
                              {day.reduce((acc, meal) => meal.kcal + acc, 0)}
                          </Stack>
                          <Stack>
                              <span>Total protein:</span>
                              {day.reduce((acc, meal) => meal.protein + acc, 0)}
                          </Stack>
                      </Cluster>
                  </Stack>
              ))
            : null}
    </Grid>
);

export default MealPlan;
