"use client";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

enum UserGoal {
  Lose2lb = "lose-2",
  Lose1lb = "lose-1",
  Lose05lb = "lose-0.5",
  Maintain = "maintain",
  Gain05lb = "gain-0.5",
  Gain1lb = "gain-1",
  Gain2lb = "gain-2",
}

enum ActivityLevel {
  Sedentary = "1.2",
  SlightlyActive = "1.375",
  ModeratelyActive = "1.55",
  VeryActive = "1.725",
  ExtraActive = "1.9",
}

type Gender = "male" | "female";

type Height = {
  feet: number;
  inches: number;
};

type FormValues = {
  weight: number;
  height: Height;
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  userGoal: UserGoal;
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
  height: yup
    .object()
    .shape({
      feet: yup.number().required("Feet is required"),
      inches: yup.number().required("Inches is required"),
    })
    .required("Height is required"),
  age: yup.number().required("Age is required"),
  gender: yup.string().oneOf(["male", "female"]).required("Gender is required"),
  activityLevel: yup
    .string()
    .oneOf([
      ActivityLevel.Sedentary,
      ActivityLevel.SlightlyActive,
      ActivityLevel.ModeratelyActive,
      ActivityLevel.VeryActive,
      ActivityLevel.ExtraActive,
    ])
    .required("Activity Level is required"),
  userGoal: yup
    .string()
    .oneOf([
      UserGoal.Lose2lb,
      UserGoal.Lose1lb,
      UserGoal.Lose05lb,
      UserGoal.Maintain,
      UserGoal.Gain05lb,
      UserGoal.Gain1lb,
      UserGoal.Gain2lb,
    ])
    .required("User Goal is required"),
});

const MacronutrientCalculator: React.FC = () => {
  const [selectedGender, setSelectedGender] = useState<Gender>();
  const [selectedGoal, setSelectedGoal] = useState<UserGoal | undefined>();
  const [selectedActivityLevel, setSelectedActivityLevel] = useState<
    ActivityLevel | undefined
  >();
  const [results, setResults] = useState<MacronutrientResults | null>(
    initialResults
  );

  const methods = useForm<FormValues>({
    resolver: yupResolver(schema),
  });
  const { control, handleSubmit, formState } = methods;

  const handleGenderSelection = (gender: "male" | "female") => {
    setSelectedGender(gender);
  };

  const handleGoalSelection = (userGoal: UserGoal) => {
    setSelectedGoal(userGoal);
  };

  const handleActivityLevelSelection = (activityLevel: ActivityLevel) => {
    setSelectedActivityLevel(activityLevel);
  };

  const onSubmit = (data: FormValues) => {
    let bmr = 0;

    if (data.gender === "male") {
      bmr = 10 * data.weight + 6.25 - 5 * data.age + 5;
    } else if (data.gender === "female") {
      bmr = 10 * data.weight + 6.25 - 5 * data.age - 161;
    }

    const tdee = bmr * parseFloat(selectedActivityLevel!);
    // Total Daily Energy Expenditure

    let goalMultiplier = 1; // Default multiplier for maintaining weight

    switch (data.userGoal) {
      case "maintain":
        goalMultiplier = 1; // Maintain weight
        break;
      case "lose-0.5":
        goalMultiplier = 0.9; // Reduce TDEE by 10% for 0.5lb/week weight loss
        break;
      case "lose-1":
        goalMultiplier = 0.8; // Reduce TDEE by 20% for 1lb/week weight loss
        break;
      case "lose-2":
        goalMultiplier = 0.6; // Reduce TDEE by 40% for 2lb/week weight loss
        break;
      case "gain-0.5":
        goalMultiplier = 1.1; // Increase TDEE by 10% for 0.5lb/week weight gain
        break;
      case "gain-1":
        goalMultiplier = 1.2; // Increase TDEE by 20% for 1lb/week weight gain
        break;
      case "gain-2":
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
    <FormProvider {...methods}>
      <section className="">
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
                  {...control}
                  className="p-2 mt-2 rounded border border-gray-300 w-full"
                />
              </label>
              <label>
                Gender:
                <div className="flex mt-2 space-x-2 ">
                  <button
                    type="button"
                    onClick={() => handleGenderSelection("male")}
                    className={`p-2 rounded border border-gray-300 w-1/2 ${
                      selectedGender === "male"
                        ? "bg-black text-white"
                        : "bg-white text-black"
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenderSelection("female")}
                    className={`p-2 rounded border border-gray-300 w-1/2 ${
                      selectedGender === "female"
                        ? "bg-black text-white"
                        : "bg-white text-black"
                    }`}
                  >
                    Female
                  </button>
                </div>
              </label>
              <div className="flex gap-x-5">
                <label className="w-1/2">
                  Height (Feet):
                  <input
                    type="number"
                    {...control}
                    className="p-2 mt-2 rounded border border-gray-300 w-full"
                  />
                </label>
                <label className="w-1/2">
                  Height (Inches):
                  <input
                    type="number"
                    {...control}
                    className="p-2 mt-2 rounded border border-gray-300 w-full"
                  />
                </label>
              </div>
              <label>
                Weight (lbs):
                <input
                  type="number"
                  {...control}
                  className="p-2 mt-2 rounded border border-gray-300 w-full"
                />
              </label>

              <label>
                Goal:
                <div className="flex flex-col md:flex-row items-center text-sm">
                  <button
                    type="button"
                    onClick={() => handleGoalSelection(UserGoal.Lose2lb)}
                    className={`p-2 rounded border border-gray-300 w-full ${
                      selectedGoal === UserGoal.Lose2lb
                        ? "bg-black text-white"
                        : "bg-white text-black"
                    }`}
                  >
                    Lose 2 lbs
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGoalSelection(UserGoal.Lose1lb)}
                    className={`p-2 rounded border border-gray-300 w-full ${
                      selectedGoal === UserGoal.Lose1lb
                        ? "bg-black text-white"
                        : "bg-white text-black"
                    }`}
                  >
                    Lose 1 lb
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGoalSelection(UserGoal.Lose05lb)}
                    className={`p-2 rounded border border-gray-300 w-full ${
                      selectedGoal === UserGoal.Lose05lb
                        ? "bg-black text-white"
                        : "bg-white text-black"
                    }`}
                  >
                    Lose 0.5 lb
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGoalSelection(UserGoal.Maintain)}
                    className={`p-2 rounded border border-gray-300 w-full ${
                      selectedGoal === UserGoal.Maintain
                        ? "bg-black text-white"
                        : "bg-white text-black"
                    }`}
                  >
                    Maintain
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGoalSelection(UserGoal.Gain05lb)}
                    className={`p-2 rounded border border-gray-300 w-full ${
                      selectedGoal === UserGoal.Gain05lb
                        ? "bg-black text-white"
                        : "bg-white text-black"
                    }`}
                  >
                    Gain 0.5 lbs
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGoalSelection(UserGoal.Gain1lb)}
                    className={`p-2 rounded border border-gray-300 w-full ${
                      selectedGoal === UserGoal.Gain1lb
                        ? "bg-black text-white"
                        : "bg-white text-black"
                    }`}
                  >
                    Gain 1 lb
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGoalSelection(UserGoal.Gain2lb)}
                    className={`p-2 rounded border border-gray-300 w-full ${
                      selectedGoal === UserGoal.Gain2lb
                        ? "bg-black text-white"
                        : "bg-white text-black"
                    }`}
                  >
                    Gain 2 lbs
                  </button>
                </div>
              </label>

              <label>
                Activity Level:
                <div className="flex flex-col md:flex-row items-center text-sm">
                  <button
                    type="button"
                    onClick={() =>
                      handleActivityLevelSelection(ActivityLevel.Sedentary)
                    }
                    className={`p-2 rounded border border-gray-300 w-full ${
                      selectedActivityLevel === ActivityLevel.Sedentary
                        ? "bg-black text-white"
                        : "bg-white text-black"
                    }`}
                  >
                    Sedentary
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleActivityLevelSelection(ActivityLevel.SlightlyActive)
                    }
                    className={`p-2 rounded border border-gray-300 w-full ${
                      selectedActivityLevel === ActivityLevel.SlightlyActive
                        ? "bg-black text-white"
                        : "bg-white text-black"
                    }`}
                  >
                    Slightly Active
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleActivityLevelSelection(
                        ActivityLevel.ModeratelyActive
                      )
                    }
                    className={`p-2 rounded border border-gray-300 w-full ${
                      selectedActivityLevel === ActivityLevel.ModeratelyActive
                        ? "bg-black text-white"
                        : "bg-white text-black"
                    }`}
                  >
                    Moderately Active
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleActivityLevelSelection(ActivityLevel.VeryActive)
                    }
                    className={`p-2 rounded border border-gray-300 w-full ${
                      selectedActivityLevel === ActivityLevel.VeryActive
                        ? "bg-black text-white"
                        : "bg-white text-black"
                    }`}
                  >
                    Very Active
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleActivityLevelSelection(ActivityLevel.ExtraActive)
                    }
                    className={`p-2 rounded border border-gray-300 w-full ${
                      selectedActivityLevel === ActivityLevel.ExtraActive
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
    </FormProvider>
  );
};

export default MacronutrientCalculator;
