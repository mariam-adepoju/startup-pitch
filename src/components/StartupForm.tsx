"use client";

import { useActionState, useState } from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import MarkdownEditor from "@uiw/react-markdown-editor"; // Ensure this package is installed
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import { formSchema } from "@/lib/validation";
import { z } from "zod"; // Ensure you have the correct import for Zod
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createPitch } from "@/lib/action"; // Ensure this import is correct

const StartupForm = () => {
  const mdStr = ``;
  const [pitch, setPitch] = useState(mdStr);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const handleFormSubmit = async (prevState: any, formData: FormData) => {
    try {
      const formValues = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        link: formData.get("link") as string,
        pitch,
      };
      await formSchema.parseAsync(formValues);
      console.log(formValues);
      const result = await createPitch(prevState, formData, pitch);
      console.log(result);

      if (result.status === "SUCCESS") {
        toast("Success", {
          description: "Your startup pitch has been successfully created",
          style: { color: "green" },
        });
        router.push(`./${result._id}`);
      }
      return result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fielderrors = error.flatten().fieldErrors;
        setErrors(fielderrors as unknown as Record<string, string>);
        toast("Error", {
          description: "Please check your inputs and try again",
          style: { color: "red" },
        });
        return { ...prevState, error: "Validation failed", status: "ERROR" };
      }
      toast("Error", {
        description: "An unexpected error has occured ",
        style: { color: "red" },
      });
      return {
        ...prevState,
        error: "An unexpected error has occured ",
        status: "ERROR",
      };
    }
  };

  const [state, formAction, isPending] = useActionState(handleFormSubmit, {
    error: "",
    status: "INITIAL",
  });

  return (
    <form action={formAction} className="startup-form">
      <div>
        <label htmlFor="title" className="startup-form_label">
          Title
        </label>
        <Input
          type="text"
          name="title"
          id="title"
          className="startup-form_input"
          placeholder="Startup Title"
          required
        />
        {errors.title && <p className="startup-form_error">{errors.title}</p>}
      </div>
      <div>
        <label htmlFor="description" className="startup-form_label">
          Description
        </label>
        <Textarea
          name="description"
          id="description"
          className="startup-form_textarea"
          placeholder="Startup Description"
          required
        />
        {errors.description && (
          <p className="startup-form_error">{errors.description}</p>
        )}
      </div>
      <div>
        <label htmlFor="category" className="startup-form_label">
          Category
        </label>
        <Input
          name="category"
          id="category"
          className="startup-form_input"
          placeholder="Startup Category (Tech, Health, Education...)"
          required
        />
        {errors.category && (
          <p className="startup-form_error">{errors.category}</p>
        )}
      </div>
      <div>
        <label htmlFor="Link" className="startup-form_label">
          Image URL
        </label>
        <Input
          name="link"
          id="link"
          className="startup-form_input"
          placeholder="Startup Image URL"
          required
        />
        {errors.link && <p className="startup-form_error">{errors.link}</p>}
      </div>
      <div data-color-mode="light">
        <label htmlFor="pitch" className="startup-form_label">
          Pitch
        </label>
        <MarkdownEditor
          value={pitch}
          onChange={(value) => setPitch(value)}
          id="pitch"
          height="300px"
          placeholder="Briefly describe your idea and what problem it solves"
          style={{ borderRadius: 20, overflow: "hidden" }}
        />
        {errors.pitch && <p className="startup-form_error">{errors.pitch}</p>}
      </div>
      <Button
        type="submit"
        className="startup-form_btn rounded-4xl"
        disabled={isPending}
      >
        {isPending ? "Submitting..." : "Submit Your Pitch"}
        <Send className="size-6 ml-2" />
      </Button>
    </form>
  );
};

export default StartupForm;
