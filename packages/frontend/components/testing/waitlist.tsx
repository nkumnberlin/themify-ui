"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, ChevronUp, MoreHorizontal, Search } from "lucide-react";

import type { DateRange } from "react-day-picker";
import { endOfDay, isWithinInterval, parseISO, startOfDay } from "date-fns";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { mockWaitlistData } from "@/components/testing/mockdata";

export type ContactPerson = "Feli" | "Olga" | "Svetlana" | null | "";
export type ContactStatus = "waiting" | "contacted" | "accepted" | "declined";
export type AvailabilityOption =
  | "monday morning"
  | "monday afternoon"
  | "tuesday morning"
  | "tuesday afternoon"
  | "wednesday morning"
  | "wednesday afternoon"
  | "thursday morning"
  | "thursday afternoon"
  | "friday morning"
  | "friday afternoon";

export interface WaitlistEntry {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  age: number;
  reason: string;
  availability: string; // Comma-separated string of availability options
  message: string;
  contactPerson: ContactPerson;
  status: ContactStatus;
  notes: string;
  createdAt: string;
}

// Define availability options
const availabilityOptions: { value: AvailabilityOption; label: string }[] = [
  { value: "monday morning", label: "Monday Morning" },
  { value: "monday afternoon", label: "Monday Afternoon" },
  { value: "tuesday morning", label: "Tuesday Morning" },
  { value: "tuesday afternoon", label: "Tuesday Afternoon" },
  { value: "wednesday morning", label: "Wednesday Morning" },
  { value: "wednesday afternoon", label: "Wednesday Afternoon" },
  { value: "thursday morning", label: "Thursday Morning" },
  { value: "thursday afternoon", label: "Thursday Afternoon" },
  { value: "friday morning", label: "Friday Morning" },
  { value: "friday afternoon", label: "Friday Afternoon" },
];

// Group by days for the availability table
const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];
const timeSlots = ["morning", "afternoon"];

export default function WaitlistManager() {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(mockWaitlistData);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof WaitlistEntry | null;
    direction: "ascending" | "descending";
  }>({
    key: "createdAt",
    direction: "descending",
  });
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(
    null,
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<WaitlistEntry>>({
    status: "waiting",
    notes: "",
    availability: "",
  });
  const [selectedAvailability, setSelectedAvailability] = useState<
    AvailabilityOption[]
  >([]);
  const [activeTab, setActiveTab] = useState("waitlist");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Filter and sort the waitlist
  const filteredAndSortedWaitlist = useMemo(() => {
    let filteredList = [...waitlist];

    // Apply search filter
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filteredList = filteredList.filter(
        (entry) =>
          entry.firstName.toLowerCase().includes(lowerCaseSearchTerm) ||
          entry.lastName.toLowerCase().includes(lowerCaseSearchTerm) ||
          entry.email.toLowerCase().includes(lowerCaseSearchTerm) ||
          entry.mobile.includes(searchTerm),
      );
    }

    // Apply date range filter
    if (dateRange?.from) {
      filteredList = filteredList.filter((entry) => {
        const entryDate = parseISO(entry.createdAt);

        if (dateRange.to) {
          // If we have a complete range, check if the date is within the range
          return isWithinInterval(entryDate, {
            start: startOfDay(dateRange?.from),
            end: endOfDay(dateRange.to),
          });
        } else {
          // If we only have a start date, check if the date is after the start date
          return entryDate >= startOfDay(dateRange?.from);
        }
      });
    }

    // Apply sorting
    if (sortConfig.key) {
      filteredList.sort((a, b) => {
        if (a[sortConfig.key!] < b[sortConfig.key!]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key!] > b[sortConfig.key!]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredList;
  }, [waitlist, searchTerm, sortConfig, dateRange]);

  // Group people by availability
  const availabilityGroups = useMemo(() => {
    const groups: Record<string, WaitlistEntry[]> = {};

    // Initialize all time slots
    availabilityOptions.forEach((option) => {
      groups[option.value] = [];
    });

    // Populate groups with filtered entries
    filteredAndSortedWaitlist.forEach((entry) => {
      if (entry.availability) {
        const slots = entry.availability.split(",");
        slots.forEach((slot) => {
          if (groups[slot]) {
            groups[slot].push(entry);
          }
        });
      }
    });

    return groups;
  }, [filteredAndSortedWaitlist]);

  // Format availability for display
  const formatAvailability = (availability: string) => {
    if (!availability) return "Not specified";

    return availability
      .split(",")
      .map((day) => {
        // Capitalize first letter of each word
        return day
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      })
      .join(", ");
  };

  // Handle availability checkbox changes
  const handleAvailabilityChange = (
    option: AvailabilityOption,
    checked: boolean,
  ) => {
    if (checked) {
      setSelectedAvailability((prev) => [...prev, option]);
    } else {
      setSelectedAvailability((prev) => prev.filter((item) => item !== option));
    }
  };

  // Update availability when editing an entry
  const handleEditAvailabilityChange = (
    entry: WaitlistEntry,
    option: AvailabilityOption,
    checked: boolean,
  ) => {
    const currentAvailabilities = entry.availability
      ? entry.availability.split(",")
      : [];

    let newAvailabilities: string[];
    if (checked) {
      newAvailabilities = [...currentAvailabilities, option];
    } else {
      newAvailabilities = currentAvailabilities.filter(
        (item) => item !== option,
      );
    }

    updateEntry(entry.id, { availability: newAvailabilities.join(",") });
  };

  // Sort function
  const requestSort = (key: keyof WaitlistEntry) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Clear date range filter
  const clearDateRange = () => {
    setDateRange(undefined);
  };

  // Update entry status or contact person
  const updateEntry = (id: string, updates: Partial<WaitlistEntry>) => {
    setWaitlist((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry)),
    );
  };

  // Add new entry
  const handleAddEntry = () => {
    const entry: WaitlistEntry = {
      id: `wl-${Date.now()}`,
      firstName: newEntry.firstName || "",
      lastName: newEntry.lastName || "",
      email: newEntry.email || "",
      mobile: newEntry.mobile || "",
      age: newEntry.age || 0,
      reason: newEntry.reason || "",
      availability: selectedAvailability.join(","),
      message: newEntry.message || "",
      contactPerson: newEntry.contactPerson || null,
      status: (newEntry.status as ContactStatus) || "waiting",
      notes: newEntry.notes || "",
      createdAt: new Date().toISOString(),
    };

    setWaitlist((prev) => [...prev, entry]);
    setNewEntry({
      status: "waiting",
      notes: "",
      availability: "",
    });
    setSelectedAvailability([]);
    setIsAddDialogOpen(false);
  };

  // Get status badge color
  const getStatusBadge = (status: ContactStatus) => {
    switch (status) {
      case "waiting":
        return <Badge variant="outline">Waiting</Badge>;
      case "contacted":
        return <Badge variant="secondary">Contacted</Badge>;
      case "accepted":
        return (
          <Badge
            variant="success"
            className="bg-green-500 text-white hover:bg-green-600"
          >
            Accepted
          </Badge>
        );
      case "declined":
        return <Badge variant="destructive">Declined</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Render sort indicator
  const renderSortIndicator = (key: keyof WaitlistEntry) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  // Mock function for database update
  const updateDatabaseEntry = async (entry: WaitlistEntry) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Updated entry in database:", entry);
  };

  const paginate = (items: WaitlistEntry[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  };

  // Add this to calculate total pages
  const totalPages = Math.ceil(filteredAndSortedWaitlist.length / itemsPerPage);

  // Add this function to handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      {/* Search, Date Range, and Add Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row">
          <div className="relative w-full sm:w-64">
            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
            <Input
              placeholder="Search waitlist..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Waitlist Entry</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={newEntry.firstName || ""}
                      onChange={(e) =>
                        setNewEntry({ ...newEntry, firstName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={newEntry.lastName || ""}
                      onChange={(e) =>
                        setNewEntry({ ...newEntry, lastName: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newEntry.email || ""}
                      onChange={(e) =>
                        setNewEntry({ ...newEntry, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile (German format)</Label>
                    <Input
                      id="mobile"
                      value={newEntry.mobile || ""}
                      onChange={(e) =>
                        setNewEntry({ ...newEntry, mobile: e.target.value })
                      }
                      placeholder="+49 123 4567890"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={newEntry.age || ""}
                      onChange={(e) =>
                        setNewEntry({
                          ...newEntry,
                          age: Number.parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={newEntry.status || "waiting"}
                      onValueChange={(value) =>
                        setNewEntry({
                          ...newEntry,
                          status: value as ContactStatus,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="waiting">Waiting</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="declined">Declined</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Availability</Label>
                  <div className="grid grid-cols-2 gap-2 rounded-md border p-3">
                    {availabilityOptions.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`availability-${option.value}`}
                          checked={selectedAvailability.includes(option.value)}
                          onCheckedChange={(checked) =>
                            handleAvailabilityChange(
                              option.value,
                              checked as boolean,
                            )
                          }
                        />
                        <Label
                          htmlFor={`availability-${option.value}`}
                          className="text-sm font-normal"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Why do you come?</Label>
                  <Textarea
                    id="reason"
                    value={newEntry.reason || ""}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, reason: e.target.value })
                    }
                    className="min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={newEntry.message || ""}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, message: e.target.value })
                    }
                    className="min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Select
                    value={newEntry.contactPerson || ""}
                    onValueChange={(value) =>
                      setNewEntry({
                        ...newEntry,
                        contactPerson: value as ContactPerson,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select contact person" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_assigned">Not assigned</SelectItem>
                      <SelectItem value="Feli">Feli</SelectItem>
                      <SelectItem value="Olga">Olga</SelectItem>
                      <SelectItem value="Svetlana">Svetlana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newEntry.notes || ""}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, notes: e.target.value })
                    }
                    className="min-h-[80px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleAddEntry}>Add Entry</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="waitlist">Waitlist</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>

        <TabsContent value="waitlist" className="mt-4">
          {/* Waitlist Table */}
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="w-[100px] cursor-pointer truncate"
                    onClick={() => requestSort("lastName")}
                  >
                    <div className="flex items-center">
                      Name {renderSortIndicator("lastName")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="hidden cursor-pointer md:table-cell"
                    onClick={() => requestSort("email")}
                  >
                    <div className="flex items-center">
                      Contact {renderSortIndicator("email")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="hidden cursor-pointer md:table-cell"
                    onClick={() => requestSort("age")}
                  >
                    <div className="flex items-center">
                      Age {renderSortIndicator("age")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => requestSort("status")}
                  >
                    <div className="flex items-center">
                      Status {renderSortIndicator("status")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="hidden cursor-pointer md:table-cell"
                    onClick={() => requestSort("contactPerson")}
                  >
                    <div className="flex items-center">
                      Contact Person {renderSortIndicator("contactPerson")}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedWaitlist.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No entries found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginate(filteredAndSortedWaitlist).map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="w-[100px] truncate font-medium">
                        <span className="block truncate">
                          {entry.firstName} {entry.lastName}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div>{entry.email}</div>
                        <div className="text-muted-foreground text-sm">
                          {entry.mobile}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {entry.age}
                      </TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {entry.contactPerson ? (
                          <Badge variant="outline">{entry.contactPerson}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Not assigned
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedEntry(entry)}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="ml-2"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                updateEntry(entry.id, { status: "waiting" })
                              }
                            >
                              Mark as Waiting
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateEntry(entry.id, { status: "contacted" })
                              }
                            >
                              Mark as Contacted
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateEntry(entry.id, { status: "accepted" })
                              }
                            >
                              Mark as Accepted
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateEntry(entry.id, { status: "declined" })
                              }
                            >
                              Mark as Declined
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {filteredAndSortedWaitlist.length > 0 && (
              <div className="flex items-center justify-between py-4">
                <div className="text-muted-foreground flex-1 text-sm">
                  Showing{" "}
                  <span className="font-medium">
                    {Math.min(
                      filteredAndSortedWaitlist.length,
                      (currentPage - 1) * itemsPerPage + 1,
                    )}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      filteredAndSortedWaitlist.length,
                      currentPage * itemsPerPage,
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {filteredAndSortedWaitlist.length}
                  </span>{" "}
                  entries
                </div>
                <div className="flex items-center space-x-6 lg:space-x-8">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Rows per page</p>
                    <Select
                      value={itemsPerPage.toString()}
                      onValueChange={(value) => {
                        setItemsPerPage(Number(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={itemsPerPage.toString()} />
                      </SelectTrigger>
                      <SelectContent side="top">
                        {[5, 10, 15, 20].map((pageSize) => (
                          <SelectItem
                            key={pageSize}
                            value={pageSize.toString()}
                          >
                            {pageSize}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            handlePageChange(Math.max(1, currentPage - 1))
                          }
                          className={
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => {
                          // Show first page, last page, and pages around current page
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  isActive={page === currentPage}
                                  onClick={() => handlePageChange(page)}
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          }

                          // Show ellipsis for gaps
                          if (page === 2 && currentPage > 3) {
                            return <PaginationEllipsis key="ellipsis-start" />;
                          }

                          if (
                            page === totalPages - 1 &&
                            currentPage < totalPages - 2
                          ) {
                            return <PaginationEllipsis key="ellipsis-end" />;
                          }

                          return null;
                        },
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            handlePageChange(
                              Math.min(totalPages, currentPage + 1),
                            )
                          }
                          className={
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="availability" className="mt-4">
          <div className="grid gap-6">
            {days.map((day) => (
              <Card key={day}>
                <CardHeader>
                  <CardTitle className="capitalize">{day}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {timeSlots.map((timeSlot) => {
                      const slotKey =
                        `${day} ${timeSlot}` as AvailabilityOption;
                      const people = availabilityGroups[slotKey] || [];

                      return (
                        <div key={timeSlot} className="space-y-2">
                          <h3 className="font-medium capitalize">{timeSlot}</h3>
                          {people.length === 0 ? (
                            <p className="text-muted-foreground text-sm">
                              No one available
                            </p>
                          ) : (
                            <div className="space-y-1">
                              {people.map((person) => (
                                <div
                                  key={person.id}
                                  className="flex items-center justify-between border-b pb-1 last:border-0"
                                >
                                  <div className="flex flex-col">
                                    <span>
                                      {person.firstName} {person.lastName}
                                    </span>
                                    <span className="text-muted-foreground text-xs">
                                      {person.contactPerson
                                        ? `Contact: ${person.contactPerson}`
                                        : "Not assigned"}
                                    </span>
                                  </div>
                                  <Badge
                                    variant={
                                      person.status === "accepted"
                                        ? "success"
                                        : person.status === "contacted"
                                          ? "secondary"
                                          : person.status === "declined"
                                            ? "destructive"
                                            : "outline"
                                    }
                                    className={
                                      person.status === "accepted"
                                        ? "bg-green-500 text-white"
                                        : ""
                                    }
                                  >
                                    {person.status}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
