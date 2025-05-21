import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";

const FULL_TEXT =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

export function CodeRenderer() {
  const [modalOpen, setModalOpen] = useState(false);
  const [acceptedText, setAcceptedText] = useState("");
  const [inputLength, setInputLength] = useState(FULL_TEXT.length);
  const [previewText, setPreviewText] = useState(FULL_TEXT);

  useEffect(() => {
    if (inputLength < 0) {
      setPreviewText("");
    } else if (inputLength > FULL_TEXT.length) {
      setPreviewText(FULL_TEXT);
    } else {
      setPreviewText(FULL_TEXT.slice(0, inputLength));
    }
  }, [inputLength]);

  function onAccept() {
    setAcceptedText(previewText);
    setModalOpen(false);
  }

  function onCancel() {
    setModalOpen(false);
    setInputLength(acceptedText.length || FULL_TEXT.length);
  }

  return (
    <div className="p-6">
      <Button onClick={() => setModalOpen(true)}>Open Modal</Button>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Define Text Length</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col space-y-4">
            <label htmlFor="length-input" className="font-medium">
              Length of displayed text
            </label>
            <Input
              id="length-input"
              type="number"
              min={0}
              max={FULL_TEXT.length}
              value={inputLength}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (!isNaN(val)) setInputLength(val);
              }}
              autoFocus
            />
            <div className="min-h-[3rem] rounded border bg-gray-50 p-4 text-gray-900">
              {previewText}
            </div>
          </div>

          <DialogFooter className="mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={onAccept}>Accept</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {acceptedText && (
        <p className="mt-6 rounded border bg-gray-100 p-4 whitespace-pre-wrap text-gray-900">
          {acceptedText}
        </p>
      )}
    </div>
  );
}
