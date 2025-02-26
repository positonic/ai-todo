"use client";
import { CreateProjectModal } from "./CreateProjectModal";

export function AddProjectButton() {
  return (
    <CreateProjectModal>
      <div role="button" tabIndex={0} className="hover:text-gray-300 cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </div>
    </CreateProjectModal>
  );
} 