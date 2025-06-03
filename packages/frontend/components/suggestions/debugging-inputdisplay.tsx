import React, { useState } from "react";
import { Input } from "@ui/input";
import { Checkbox } from "@ui/checkbox";

export default function InputDisplay() {
  const [inputValue, setInputValue] = useState("");
  const [checkboxValue, setCheckboxValue] = useState<string | null>(null);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
  }

  function handleCheckboxChange(value: string) {
    setCheckboxValue(value);
  }

  return (
    <section className="mx-auto max-w-md p-4">
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="write something"
        className="mb-4"
      />
      <div className="mb-4 flex space-x-4">
        <label className="flex items-center space-x-2">
          <Checkbox
            checked={checkboxValue === "YES"}
            onCheckedChange={() => handleCheckboxChange("YES")}
            className="rounded-full"
          />
          <span>YES</span>
        </label>
        <label className="flex items-center space-x-2">
          <Checkbox
            checked={checkboxValue === "NO"}
            onCheckedChange={() => handleCheckboxChange("NO")}
            className="rounded-full"
          />
          <span>NO</span>
        </label>
      </div>
      <div
        className="rounded border bg-amber-200 p-4 text-gray-800"
        placeholder="this could be your text!"
      >
        {inputValue}
      </div>
    </section>
  );
}
