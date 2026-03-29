"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";

type Option = {
  id: string;
  label: string;
};

export function CreateUserPanel({
  departments,
  costCenters,
  managers
}: {
  departments: Option[];
  costCenters: Option[];
  managers: Option[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    roleKey: "EMPLOYEE",
    departmentId: "",
    costCenterId: "",
    title: "",
    country: "",
    managerId: ""
  });

  const selectableManagers = useMemo(
    () => (form.roleKey === "ADMIN" ? [] : managers),
    [form.roleKey, managers]
  );

  async function onSubmit() {
    setError("");
    setSuccess("");

    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = await response.json().catch(() => ({ message: "Could not create user." }));
    if (!response.ok) {
      setError(data.message ?? "Could not create user.");
      return;
    }

    setSuccess(`${data.user.name} is ready to sign in.`);
    setForm({
      name: "",
      email: "",
      password: "",
      roleKey: "EMPLOYEE",
      departmentId: "",
      costCenterId: "",
      title: "",
      country: "",
      managerId: ""
    });

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <Card className="p-6 lg:p-7">
      <div className="flex flex-col gap-2">
        <span className="eyebrow">Create user</span>
        <h3 className="text-2xl font-semibold tracking-tight">Add a manager or employee</h3>
        <p className="text-sm text-muted">
          Provision users directly inside the workspace and attach them to departments, cost centers,
          and reporting lines from day one.
        </p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Input
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          placeholder="Full name"
        />
        <Input
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          placeholder="Work email"
          type="email"
        />
        <Input
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          placeholder="Temporary password"
          type="password"
        />
        <Select
          value={form.roleKey}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              roleKey: event.target.value,
              managerId: event.target.value === "ADMIN" ? "" : current.managerId
            }))
          }
        >
          <option value="EMPLOYEE">Employee</option>
          <option value="MANAGER">Manager</option>
          <option value="ADMIN">Admin</option>
        </Select>
        <Input
          value={form.title}
          onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          placeholder="Job title"
        />
        <Input
          value={form.country}
          onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))}
          placeholder="Country"
        />
        <Select
          value={form.departmentId}
          onChange={(event) => setForm((current) => ({ ...current, departmentId: event.target.value }))}
        >
          <option value="">Department</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.label}
            </option>
          ))}
        </Select>
        <Select
          value={form.costCenterId}
          onChange={(event) => setForm((current) => ({ ...current, costCenterId: event.target.value }))}
        >
          <option value="">Cost center</option>
          {costCenters.map((costCenter) => (
            <option key={costCenter.id} value={costCenter.id}>
              {costCenter.label}
            </option>
          ))}
        </Select>
        <div className="sm:col-span-2">
          <Select
            value={form.managerId}
            onChange={(event) => setForm((current) => ({ ...current, managerId: event.target.value }))}
            disabled={!selectableManagers.length}
          >
            <option value="">
              {selectableManagers.length ? "Assign reporting manager" : "No manager assignment needed"}
            </option>
            {selectableManagers.map((manager) => (
              <option key={manager.id} value={manager.id}>
                {manager.label}
              </option>
            ))}
          </Select>
        </div>
      </div>
      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
      {success ? <p className="mt-4 text-sm text-emerald-300">{success}</p> : null}
      <div className="mt-6 flex justify-end">
        <Button onClick={onSubmit} disabled={isPending}>
          {isPending ? "Creating user..." : "Create user"}
        </Button>
      </div>
    </Card>
  );
}
