"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";

enum ActivityLevel {
  Sedentary = 1.2,
  SlightlyActive = 1.375,
  ModeratelyActive = 1.55,
  VeryActive = 1.725,
  ExtraActive = 1.9,
}

enum Goal {
  Maintain = "maintain",
  Lose0_5 = "lose-0.5",
  Lose1 = "lose-1",
  Lose2 = "lose-2",
  Gain0_5 = "gain-0.5",
  Gain1 = "gain-1",
  Gain2 = "gain-2",
}

type FormValues = {
  weight: number;
  heightFeet: number;
  heightInches: number;
  age: number;
  gender: "male" | "female";
  activityLevel: ActivityLevel;
  goal: Goal;
};
type MacronutrientResults = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

const initialResults: MacronutrientResults = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
};

const MacronutrientCalculator: React.FC = () => {
  const { register, handleSubmit, formState } = useForm<FormValues>();
  const [results, setResults] = useState<MacronutrientResults | null>(
    initialResults
  );

  const onSubmit = (data: FormValues) => {
    let bmr = 0;

    if (data.gender === "male") {
      bmr = 10 * data.weight + 6.25 - 5 * data.age + 5;
    } else if (data.gender === "female") {
      bmr = 10 * data.weight + 6.25 - 5 * data.age - 161;
    }

    const tdee = bmr * data.activityLevel; // Total Daily Energy Expenditure

    let goalMultiplier = 1; // Default multiplier for maintaining weight

    switch (data.goal) {
      case Goal.Maintain:
        goalMultiplier = 1; // Maintain weight
        break;
      case Goal.Lose0_5:
        goalMultiplier = 0.9; // Reduce TDEE by 10% for 0.5lb/week weight loss
        break;
      case Goal.Lose1:
        goalMultiplier = 0.8; // Reduce TDEE by 20% for 1lb/week weight loss
        break;
      case Goal.Lose2:
        goalMultiplier = 0.6; // Reduce TDEE by 40% for 2lb/week weight loss
        break;
      case Goal.Gain0_5:
        goalMultiplier = 1.1; // Increase TDEE by 10% for 0.5lb/week weight gain
        break;
      case Goal.Gain1:
        goalMultiplier = 1.2; // Increase TDEE by 20% for 1lb/week weight gain
        break;
      case Goal.Gain2:
        goalMultiplier = 1.4; // Increase TDEE by 40% for 2lb/week weight gain
        break;
      default:
        break;
    }

    const adjustedTdee = tdee * goalMultiplier;

    const protein = (adjustedTdee * 0.25) / 4; // 25% of calories from protein (4 calories per gram)
    const carbs = (adjustedTdee * 0.45) / 4; // 45% of calories from carbs (4 calories per gram)
    const fat = (adjustedTdee * 0.3) / 9; // 30% of calories from fat (9 calories per gram)

    setResults({
      calories: adjustedTdee,
      protein,
      carbs,
      fat,
    });
  };

  return (
    <section>
      <h1 className="mx-auto text-5xl text-center mb-10">
        Macronutrient Calculator
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white py-8 px-2 rounded-xl shadow-md lg:p-8 sm:px-4 mx-5"
      >
        <div className="flex flex-col space-y-6">
          <div className="grid grid-cols-1 space-y-3">
            <label className="">
              Age:
              <input
                type="number"
                {...register("age")}
                className="p-2 mt-2 rounded border border-gray-300 w-full"
              />
            </label>
            <label>
              Gender:
              <select
                {...register("gender")}
                className="p-2 mt-2 rounded border border-gray-300 w-full"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>

            <div className="flex gap-x-5">
              <label className="w-1/2">
                Height (Feet):
                <input
                  type="number"
                  {...register("heightFeet")}
                  className="p-2 mt-2 rounded border border-gray-300 w-full"
                />
              </label>
              <label className="w-1/2">
                Height (Inches):
                <input
                  type="number"
                  {...register("heightInches")}
                  className="p-2 mt-2 rounded border border-gray-300 w-full"
                />
              </label>
            </div>
            <label>
              Weight (lbs):
              <input
                type="number"
                {...register("weight")}
                className="p-2 mt-2 rounded border border-gray-300 w-full"
              />
            </label>
            <label>
              Goal:
              <select
                {...register("goal")}
                className="p-2 mt-2 rounded border border-gray-300 w-full"
              >
                <option value="maintain">Maintain Weight</option>
                <option value="lose-0.5">Weight loss of 0.5lb per week</option>
                <option value="lose-1">Weight loss of 1lb per week</option>
                <option value="lose-2">Weight loss of 2lb per week</option>
                <option value="gain-0.5">Weight gain of 0.5lb per week</option>
                <option value="gain-1">Weight gain of 1lb per week</option>
                <option value="gain-2">Weight gain of 2lb per week</option>
              </select>
            </label>
            <label>
              Activity Level:
              <select
                {...register("activityLevel")}
                className="p-2 mt-2 rounded border border-gray-300 w-full"
              >
                <option value={1.2}>Sedentary</option>
                <option value={1.375}>Slightly Active</option>
                <option value={1.55}>Moderately Active</option>
                <option value={1.725}>Very Active</option>
                <option value={1.9}>Extra Active</option>
              </select>
            </label>
          </div>
        </div>
        <button
          type="submit"
          disabled={formState.isSubmitting}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Calculate
        </button>
      </form>
      {results && (
        <div className="my-10 text-center">
          <h3 className="text-xl font-semibold">Your Macronutrients</h3>
          <div className="flex flex-col space-y-2 mt-2">
            <p>Total Calories: {Math.round(results.calories)}</p>
            <p>Protein: {Math.round(results.protein)} grams</p>
            <p>Carbohydrates: {Math.round(results.carbs)} grams</p>
            <p>Fat: {Math.round(results.fat)} grams</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default MacronutrientCalculator;
