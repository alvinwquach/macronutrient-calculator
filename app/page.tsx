"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

enum ActivityLevel {
  Sedentary = 1.2,
  SlightlyActive = 1.375,
  ModeratelyActive = 1.55,
  VeryActive = 1.725,
  ExtraActive = 1.9,
}

enum UserGoal {
  Maintain = "maintain",
  Lose0_5 = "lose-0.5",
  Lose1 = "lose-1",
  Lose2 = "lose-2",
  Gain0_5 = "gain-0.5",
  Gain1 = "gain-1",
  Gain2 = "gain-2",
}

type FormValues = {
  age: number;
  gender: "male" | "female";
  heightFeet: number;
  heightInches: number;
  weight: number;
  userGoal: UserGoal;
  activityLevel: ActivityLevel;
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

const schema = yup.object().shape({
  weight: yup.number().required("Weight is required"),
  heightFeet: yup.number().required("Feet is required"),
  heightInches: yup.number().required("Inches is required"),
  age: yup.number().required("Age is required"),
  gender: yup.string().oneOf(["male", "female"]).required("Gender is required"),
  activityLevel: yup
    .number()
    .oneOf(Object.values(ActivityLevel).map((value) => value as number))
    .required("Activity level is required"),
  userGoal: yup
    .string()
    .oneOf(Object.values(UserGoal))
    .required("Goal is required"),
});

const MacronutrientCalculator: React.FC = () => {
  const [results, setResults] = useState<MacronutrientResults | null>(
    initialResults
  );

  const methods = useForm<FormValues>({
    resolver: yupResolver(schema),
  });
  const { register, handleSubmit, reset, formState, setValue, watch } = methods;

  const onSubmit = (data: FormValues) => {
    let bmr = 0;

    if (data.gender === "male") {
      bmr = 10 * data.weight + 6.25 - 5 * data.age + 5;
    } else if (data.gender === "female") {
      bmr = 10 * data.weight + 6.25 - 5 * data.age - 161;
    }

    const tdee = bmr * data.activityLevel; // Total Daily Energy Expenditure

    let goalMultiplier = 1; // Default multiplier for maintaining weight

    switch (data.userGoal) {
      case UserGoal.Maintain:
        goalMultiplier = 1; // Maintain weight
        break;
      case UserGoal.Lose0_5:
        goalMultiplier = 0.9; // Reduce TDEE by 10% for 0.5lb/week weight loss
        break;
      case UserGoal.Lose1:
        goalMultiplier = 0.8; // Reduce TDEE by 20% for 1lb/week weight loss
        break;
      case UserGoal.Lose2:
        goalMultiplier = 0.6; // Reduce TDEE by 40% for 2lb/week weight loss
        break;
      case UserGoal.Gain0_5:
        goalMultiplier = 1.1; // Increase TDEE by 10% for 0.5lb/week weight gain
        break;
      case UserGoal.Gain1:
        goalMultiplier = 1.2; // Increase TDEE by 20% for 1lb/week weight gain
        break;
      case UserGoal.Gain2:
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

  const onReset = () => reset();

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
            <label className="dark:text-black">
              Age:
              <input
                type="number"
                {...register("age")}
                className=" p-2 mt-2 rounded border border-gray-300 w-full"
              />
            </label>
            <label className="dark:text-black">
              Gender:
              <div className="flex mt-2 gap-x-4">
                <button
                  type="button"
                  onClick={() => setValue("gender", "male")}
                  className={`flex-1 py-2 px-4 rounded border border-gray-300 w-1/2 ${
                    watch("gender") === "male"
                      ? "bg-black text-white"
                      : "bg-white text-black"
                  }`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setValue("gender", "female")}
                  className={`flex-1 py-2 px-4 rounded border border-gray-300 w-1/2 ${
                    watch("gender") === "female"
                      ? "bg-black text-white"
                      : "bg-white text-black"
                  }`}
                >
                  Female
                </button>
              </div>
            </label>

            <div className="flex gap-x-5">
              <label className="dark:text-black w-1/2">
                Height (Feet):
                <input
                  type="number"
                  {...register("heightFeet")}
                  className="p-2 mt-2 rounded border border-gray-300 w-full"
                />
              </label>
              <label className="dark:text-black w-1/2">
                Height (Inches):
                <input
                  type="number"
                  {...register("heightInches")}
                  className="p-2 mt-2 rounded border border-gray-300 w-full"
                />
              </label>
            </div>
            <label className="dark:text-black">
              Weight (Lbs):
              <input
                type="number"
                {...register("weight")}
                className="p-2 mt-2 rounded border border-gray-300 w-full"
              />
            </label>
            <label className="dark:text-black  md:text-left text-center">
              Goal:
              <div className="flex flex-col md:flex-row items-center text-sm gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setValue("userGoal", UserGoal.Lose2)}
                  className={`flex-1 py-1 px-2 rounded border border-gray-300 w-1/2 ${
                    watch("userGoal") === UserGoal.Lose2
                      ? "bg-black text-white"
                      : "bg-white text-black"
                  }`}
                >
                  Lose 2 lbs
                </button>
                <button
                  type="button"
                  onClick={() => setValue("userGoal", UserGoal.Lose1)}
                  className={`flex-1 py-1 px-2 rounded border border-gray-300 w-1/2 ${
                    watch("userGoal") === UserGoal.Lose1
                      ? "bg-black text-white"
                      : "bg-white text-black"
                  }`}
                >
                  Lose 1 lb
                </button>
                <button
                  type="button"
                  onClick={() => setValue("userGoal", UserGoal.Lose0_5)}
                  className={`flex-1 py-1 px-2 rounded border border-gray-300 w-1/2 ${
                    watch("userGoal") === UserGoal.Lose0_5
                      ? "bg-black text-white"
                      : "bg-white text-black"
                  }`}
                >
                  Lose 0.5 lb
                </button>

                <button
                  type="button"
                  onClick={() => setValue("userGoal", UserGoal.Maintain)}
                  className={`flex-1 py-1 px-2 rounded border border-gray-300 w-1/2 ${
                    watch("userGoal") === UserGoal.Maintain
                      ? "bg-black text-white"
                      : "bg-white text-black"
                  }`}
                >
                  Maintain
                </button>

                <button
                  type="button"
                  onClick={() => setValue("userGoal", UserGoal.Gain0_5)}
                  className={`flex-1 py-1 px-2 rounded border border-gray-300 w-1/2 ${
                    watch("userGoal") === UserGoal.Gain0_5
                      ? "bg-black text-white"
                      : "bg-white text-black"
                  }`}
                >
                  Gain 0.5 lb
                </button>
                <button
                  type="button"
                  onClick={() => setValue("userGoal", UserGoal.Gain1)}
                  className={`flex-1 py-1 px-2 rounded border border-gray-300 w-1/2 ${
                    watch("userGoal") === UserGoal.Gain1
                      ? "bg-black text-white"
                      : "bg-white text-black"
                  }`}
                >
                  Gain 1 lb
                </button>
                <button
                  type="button"
                  onClick={() => setValue("userGoal", UserGoal.Gain2)}
                  className={`flex-1 py-1 px-2 rounded border border-gray-300 w-1/2 ${
                    watch("userGoal") === UserGoal.Gain2
                      ? "bg-black text-white"
                      : "bg-white text-black"
                  }`}
                >
                  Gain 2 lbs
                </button>
              </div>
            </label>
            <label className="dark:text-black md:text-left text-center">
              Activity Level:
              <div className="flex flex-col md:flex-row items-center text-sm gap-2 mt-2">
                <button
                  type="button"
                  onClick={() =>
                    setValue("activityLevel", ActivityLevel.Sedentary)
                  }
                  className={`flex-1 py-1 px-2 rounded border border-gray-300 w-1/2 ${
                    watch("activityLevel") === ActivityLevel.Sedentary
                      ? "bg-black text-white"
                      : "bg-white text-black"
                  }`}
                >
                  Sedentary
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setValue("activityLevel", ActivityLevel.SlightlyActive)
                  }
                  className={`flex-1 py-1 px-2 rounded border border-gray-300 w-1/2 ${
                    watch("activityLevel") === ActivityLevel.SlightlyActive
                      ? "bg-black text-white"
                      : "bg-white text-black"
                  }`}
                >
                  Slightly Active
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setValue("activityLevel", ActivityLevel.ModeratelyActive)
                  }
                  className={`flex-1 py-1 px-2 rounded border border-gray-300 w-1/2 ${
                    watch("activityLevel") === ActivityLevel.ModeratelyActive
                      ? "bg-black text-white"
                      : "bg-white text-black"
                  }`}
                >
                  Moderately Active
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setValue("activityLevel", ActivityLevel.VeryActive)
                  }
                  className={`flex-1 py-1 px-2 rounded border border-gray-300 w-1/2 ${
                    watch("activityLevel") === ActivityLevel.VeryActive
                      ? "bg-black text-white"
                      : "bg-white text-black"
                  }`}
                >
                  Very Active
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setValue("activityLevel", ActivityLevel.ExtraActive)
                  }
                  className={`flex-1 py-1 px-2 rounded border border-gray-300 w-1/2 ${
                    watch("activityLevel") === ActivityLevel.ExtraActive
                      ? "bg-black text-white"
                      : "bg-white text-black"
                  }`}
                >
                  Extra Active
                </button>
              </div>
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-x-2">
          <button
            type="submit"
            disabled={formState.isSubmitting}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Calculate
          </button>
          <button
            onClick={onReset}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            Reset
          </button>
        </div>
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
