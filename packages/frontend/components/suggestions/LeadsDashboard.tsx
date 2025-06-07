"use client";
import React, { useMemo, useState } from "react";
import { Button } from "@ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ui/dialog";
import { Checkbox } from "@ui/checkbox";
import { ScrollArea } from "@ui/scroll-area";

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  inquiryDate: string;
  status: "new" | "contacted" | "processed";
  notes: string;
};

const sampleLeads: Lead[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@example.com",
    phone: "555-1234",
    inquiryDate: "2024-06-01",
    status: "new",
    notes: "",
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@example.com",
    phone: "555-5678",
    inquiryDate: "2024-06-02",
    status: "contacted",
    notes: "Called on 6/3, left voicemail",
  },
  {
    id: "3",
    name: "Carol White",
    email: "carol@example.com",
    phone: "555-8765",
    inquiryDate: "2024-06-03",
    status: "processed",
    notes: "Sent quote",
  },
  // Add more sample leads as needed
];

function LeadDetailDialog({
  lead,
  onUpdate,
}: {
  lead: Lead;
  onUpdate: (updatedLead: Lead) => void;
}) {
  const [notes, setNotes] = useState(lead.notes);
  const [status, setStatus] = useState<Lead["status"]>(lead.status);

  function handleSave() {
    onUpdate({ ...lead, notes, status });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Lead Detail - {lead.name}</DialogTitle>
        </DialogHeader>
        <div className="mt-2 space-y-4">
          <div>
            <p>
              <strong>Email:</strong> {lead.email}
            </p>
            <p>
              <strong>Phone:</strong> {lead.phone}
            </p>
            <p>
              <strong>Inquiry Date:</strong> {lead.inquiryDate}
            </p>
          </div>
          <div>
            <label className="mb-1 block font-medium" htmlFor="status-select">
              Status
            </label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as Lead["status"])}
            >
              <SelectTrigger id="status-select" className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block font-medium" htmlFor="notes-textarea">
              Notes
            </label>
            <textarea
              id="notes-textarea"
              className="min-h-[80px] w-full resize-y rounded-md border border-gray-300 p-2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function LeadsDashboard() {
  const [leads, setLeads] = useState<Lead[]>(sampleLeads);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<Lead["status"] | "all">(
    "all",
  );
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(
    new Set(),
  );

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(search.toLowerCase()) ||
        lead.email.toLowerCase().includes(search.toLowerCase()) ||
        lead.phone.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || lead.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [leads, search, filterStatus]);

  function toggleSelectLead(id: string) {
    setSelectedLeadIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  function toggleSelectAll() {
    if (selectedLeadIds.size === filteredLeads.length) {
      setSelectedLeadIds(new Set());
    } else {
      setSelectedLeadIds(new Set(filteredLeads.map((l) => l.id)));
    }
  }

  function updateLead(updatedLead: Lead) {
    setLeads((prev) =>
      prev.map((l) => (l.id === updatedLead.id ? updatedLead : l)),
    );
  }

  function bulkMarkContacted() {
    setLeads((prev) =>
      prev.map((lead) =>
        selectedLeadIds.has(lead.id) ? { ...lead, status: "contacted" } : lead,
      ),
    );
    setSelectedLeadIds(new Set());
  }

  function bulkDelete() {
    setLeads((prev) => prev.filter((lead) => !selectedLeadIds.has(lead.id)));
    setSelectedLeadIds(new Set());
  }

  return (
    <main className="mx-auto max-w-7xl p-6">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Leads Dashboard</h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* Removed the Input field as requested */}
          <Select
            value={filterStatus}
            onValueChange={(value) =>
              setFilterStatus(value as Lead["status"] | "all")
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="processed">Processed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <section className="mb-4 flex gap-2">
        <Button
          disabled={selectedLeadIds.size === 0}
          onClick={bulkMarkContacted}
          className="bg-green-600 text-white hover:bg-green-700"
        >
          Mark Contacted
        </Button>
        <Button
          variant="destructive"
          disabled={selectedLeadIds.size === 0}
          onClick={bulkDelete}
        >
          Delete
        </Button>
      </section>

      <ScrollArea className="rounded-md border border-gray-200">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selectedLeadIds.size === filteredLeads.length &&
                    filteredLeads.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all leads"
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Inquiry Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-6 text-center text-gray-500"
                >
                  No leads found.
                </TableCell>
              </TableRow>
            )}
            {filteredLeads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedLeadIds.has(lead.id)}
                    onCheckedChange={() => toggleSelectLead(lead.id)}
                    aria-label={`Select lead ${lead.name}`}
                  />
                </TableCell>
                <TableCell>{lead.name}</TableCell>
                <TableCell>{lead.email}</TableCell>
                <TableCell>{lead.phone}</TableCell>
                <TableCell>{lead.inquiryDate}</TableCell>
                <TableCell className="capitalize">{lead.status}</TableCell>
                <TableCell>
                  <LeadDetailDialog
                    lead={lead}
                    onUpdate={(updatedLead) => updateLead(updatedLead)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </main>
  );
}
