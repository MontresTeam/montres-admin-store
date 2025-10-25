"use client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import UserAvatar from "@/public/assets/MyAvtar.jpg";
import axios from "axios";
import { Edit, Eye, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UserTable() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get("http://localhost:9000/api/customers/");
        setCustomers(response.data.customers);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleEdit = (id) => {
    router.push(`/UpdatedUser/${id}`);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this customer?")) {
      return;
    }

    setDeletingId(id);
    try {
      await axios.delete(`http://localhost:9000/api/customers/${id}`);
      
      // Remove the customer from the local state
      setCustomers(customers.filter(customer => customer._id !== id));
      
      alert("Customer deleted successfully!");
    } catch (err) {
      console.error("Error deleting customer:", err);
      alert("Failed to delete customer. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg">Loading customers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 first:border-s last:border-e dark:border-slate-600 rounded-tl-lg w-[80px]">
            S.L
          </TableHead>
          <TableHead className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 first:border-s last:border-e dark:border-slate-600 ">
            Join Date
          </TableHead>
          <TableHead className="px-4 h-12 text-start bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 first:border-s last:border-e dark:border-slate-600 ">
            Name
          </TableHead>
          <TableHead className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 first:border-s last:border-e dark:border-slate-600 ">
            Email
          </TableHead>
          <TableHead className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 first:border-s last:border-e dark:border-slate-600 ">
            Designation
          </TableHead>
          <TableHead className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 first:border-s last:border-e dark:border-slate-600 text-center">
            Status
          </TableHead>
          <TableHead className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 first:border-s last:border-e dark:border-slate-600 text-center rounded-tr-lg">
            Action
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer, index) => {
          const isLast = index === customers.length - 1;
          return (
            <TableRow key={customer._id}>
              <TableCell
                className={`py-4 px-4 border-b text-center first:border-s last:border-e border-neutral-200 dark:border-slate-600 ${
                  isLast ? "rounded-bl-lg" : ""
                }`}
              >
                {String(customer.serialNumber).padStart(2, "0")}
              </TableCell>
              <TableCell
                className={`py-4 px-4 border-b text-center first:border-s last:border-e border-neutral-200 dark:border-slate-600 ${
                  isLast ? "rounded-bl-lg" : ""
                }`}
              >
                {formatDate(customer.joinDate)}
              </TableCell>
              <TableCell
                className={`py-4 px-4 border-b text-center first:border-s last:border-e border-neutral-200 dark:border-slate-600 ${
                  isLast ? "rounded-bl-lg" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <Image
                    src={UserAvatar}
                    alt={customer.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="capitalize">{customer.username}</span>
                </div>
              </TableCell>
              <TableCell
                className={`py-4 px-4 border-b text-center first:border-s last:border-e border-neutral-200 dark:border-slate-600 ${
                  isLast ? "rounded-bl-lg" : ""
                }`}
              >
                {customer.email}
              </TableCell>
              <TableCell
                className={`py-4 px-4 border-b text-center first:border-s last:border-e border-neutral-200 dark:border-slate-600 ${
                  isLast ? "rounded-bl-lg" : ""
                }`}
              >
                {customer.designation}
              </TableCell>
              <TableCell
                className={`py-4 px-4 border-b text-center first:border-s last:border-e border-neutral-200 dark:border-slate-600 ${
                  isLast ? "rounded-bl-lg" : ""
                }`}
              >
                <span
                  className={`px-3 py-1.5 rounded text-sm font-medium border ${
                    customer.status === "active"
                      ? "bg-green-600/15 text-green-600 border-green-600"
                      : "bg-gray-600/15 text-gray-600 dark:text-white border-gray-400"
                  }`}
                >
                  {customer.status.charAt(0).toUpperCase() +
                    customer.status.slice(1)}
                </span>
              </TableCell>
              <TableCell
                className={`py-4 px-4 border-b text-center first:border-s last:border-e border-neutral-200 dark:border-slate-600 ${
                  isLast ? "rounded-bl-lg" : ""
                }`}
              >
                <div className="flex justify-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-[50%] text-blue-500 bg-primary/10"
                  >
                    <Eye className="w-5 h-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-[50%] text-green-600 bg-green-600/10"
                    onClick={() => handleEdit(customer._id)}
                  >
                    <Edit className="w-5 h-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-[50%] text-red-500 bg-red-500/10"
                    onClick={() => handleDelete(customer._id)}
                    disabled={deletingId === customer._id}
                  >
                    {deletingId === customer._id ? (
                      <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}