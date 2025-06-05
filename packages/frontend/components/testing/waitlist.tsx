import React, { useMemo, useState } from "react";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
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
    <Dialog data-block-id="components/testing/waitlist.tsx line:85">
      <DialogTrigger asChild data-block-id="components/testing/waitlist.tsx line:86">
        <Button variant="outline" size="sm" data-block-id="components/testing/waitlist.tsx line:87">
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg" data-block-id="components/testing/waitlist.tsx line:91">
        <DialogHeader data-block-id="components/testing/waitlist.tsx line:92">
          <DialogTitle data-block-id="components/testing/waitlist.tsx line:93">Lead Detail - {lead.name}</DialogTitle>
        </DialogHeader>
        <div className="mt-2 space-y-4" data-block-id="components/testing/waitlist.tsx line:95">
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
              onValueChange={(value) => setStatus(value as Lead["status"])} data-block-id="components/testing/waitlist.tsx line:111"
            >
              <SelectTrigger id="status-select" className="w-full" data-block-id="components/testing/waitlist.tsx line:115">
                <SelectValue placeholder="Select status" data-block-id="components/testing/waitlist.tsx line:116" />
              </SelectTrigger>
              <SelectContent data-block-id="components/testing/waitlist.tsx line:118">
                <SelectItem value="new" data-block-id="components/testing/waitlist.tsx line:119">New</SelectItem>
                <SelectItem value="contacted" data-block-id="components/testing/waitlist.tsx line:120">Contacted</SelectItem>
                <SelectItem value="processed" data-block-id="components/testing/waitlist.tsx line:121">Processed</SelectItem>
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
          <div className="flex justify-end space-x-2" data-block-id="components/testing/waitlist.tsx line:136">
            <Button onClick={handleSave} data-block-id="components/testing/waitlist.tsx line:137">Save</Button>
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
    <main className="mx-auto max-w-7xl p-6" data-block-id="components/testing/waitlist.tsx line:208">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Leads Dashboard</h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center" data-block-id="components/testing/waitlist.tsx line:211">
          <Input
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs rounded-none" data-block-id="components/testing/waitlist.tsx line:212"
          />
          <Select
            value={filterStatus}
            onValueChange={(value) =>
              setFilterStatus(value as Lead["status"] | "all")
            } data-block-id="components/testing/waitlist.tsx line:218"
          >
            <SelectTrigger className="w-40" data-block-id="components/testing/waitlist.tsx line:224">
              <SelectValue placeholder="Filter by status" data-block-id="components/testing/waitlist.tsx line:225" />
            </SelectTrigger>
            <SelectContent data-block-id="components/testing/waitlist.tsx line:227">
              <SelectItem value="all" data-block-id="components/testing/waitlist.tsx line:228">All</SelectItem>
              <SelectItem value="new" data-block-id="components/testing/waitlist.tsx line:229">New</SelectItem>
              <SelectItem value="contacted" data-block-id="components/testing/waitlist.tsx line:230">Contacted</SelectItem>
              <SelectItem value="processed" data-block-id="components/testing/waitlist.tsx line:231">Processed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <section className="mb-4 flex gap-2" data-block-id="components/testing/waitlist.tsx line:237">
        <Button
          disabled={selectedLeadIds.size === 0}
          onClick={bulkMarkContacted}
          className="bg-green-600 text-white hover:bg-green-700" data-block-id="components/testing/waitlist.tsx line:238"
        >
          Mark Contacted
        </Button>
        <Button
          variant="destructive"
          disabled={selectedLeadIds.size === 0}
          onClick={bulkDelete} data-block-id="components/testing/waitlist.tsx line:245"
        >
          Delete
        </Button>
      </section>

      <ScrollArea className="rounded-md border border-gray-200" data-block-id="components/testing/waitlist.tsx line:254">
        <Table className="min-w-full" data-block-id="components/testing/waitlist.tsx line:255">
          <TableHeader data-block-id="components/testing/waitlist.tsx line:256">
            <TableRow data-block-id="components/testing/waitlist.tsx line:257">
              <TableHead className="w-12" data-block-id="components/testing/waitlist.tsx line:258">
                <Checkbox
                  checked={
                    selectedLeadIds.size === filteredLeads.length &&
                    filteredLeads.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all leads" data-block-id="components/testing/waitlist.tsx line:259"
                />
              </TableHead>
              <TableHead data-block-id="components/testing/waitlist.tsx line:268">Name</TableHead>
              <TableHead data-block-id="components/testing/waitlist.tsx line:269">Email</TableHead>
              <TableHead data-block-id="components/testing/waitlist.tsx line:270">Phone</TableHead>
              <TableHead data-block-id="components/testing/waitlist.tsx line:271">Inquiry Date</TableHead>
              <TableHead data-block-id="components/testing/waitlist.tsx line:272">Status</TableHead>
              <TableHead className="w-24" data-block-id="components/testing/waitlist.tsx line:273">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody data-block-id="components/testing/waitlist.tsx line:276">
            {filteredLeads.length === 0 && (
              <TableRow data-block-id="components/testing/waitlist.tsx line:278">
                <TableCell
                  colSpan={7}
                  className="py-6 text-center text-gray-500" data-block-id="components/testing/waitlist.tsx line:279"
                >
                  No leads found.
                </TableCell>
              </TableRow>
            )}
            {filteredLeads.map((lead) => (
              <TableRow key={lead.id} data-block-id="components/testing/waitlist.tsx line:288">
                <TableCell data-block-id="components/testing/waitlist.tsx line:289">
                  <Checkbox
                    checked={selectedLeadIds.has(lead.id)}
                    onCheckedChange={() => toggleSelectLead(lead.id)}
                    aria-label={`Select lead ${lead.name}`} data-block-id="components/testing/waitlist.tsx line:290"
                  />
                </TableCell>
                <TableCell data-block-id="components/testing/waitlist.tsx line:296">{lead.name}</TableCell>
                <TableCell data-block-id="components/testing/waitlist.tsx line:297">{lead.email}</TableCell>
                <TableCell data-block-id="components/testing/waitlist.tsx line:298">{lead.phone}</TableCell>
                <TableCell data-block-id="components/testing/waitlist.tsx line:299">{lead.inquiryDate}</TableCell>
                <TableCell className="capitalize" data-block-id="components/testing/waitlist.tsx line:300">{lead.status}</TableCell>
                <TableCell data-block-id="components/testing/waitlist.tsx line:301">
                  <LeadDetailDialog
                    lead={lead}
                    onUpdate={(updatedLead) => updateLead(updatedLead)} data-block-id="components/testing/waitlist.tsx line:302"
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
