import { createPromptModule } from "inquirer";

const prompt = createPromptModule();

export async function promptForProjectNames(numOfProjects) {
  const questions = [];

  for (let i = 0; i < numOfProjects; i++) {
    questions.push({
      type: "input",
      name: `project${i + 1}`,
      message: `Enter name for microfrontend project ${i + 1}:`,
      default: `microfrontend-${i + 1}`,
    });
  }

  const answers = await prompt(questions);
  return Object.values(answers);
}
