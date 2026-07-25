"use client";

import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/common/status";
import { formatDateTime } from "@/lib/format";
import type { Cluster } from "@/types";

export function ClusterTable({
  clusters,
  nodeCounts,
  onEdit,
  onDelete,
}: {
  clusters: Cluster[];
  nodeCounts: Record<number, number>;
  onEdit: (cluster: Cluster) => void;
  onDelete: (cluster: Cluster) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Health</TableHead>
          <TableHead>Nodes</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {clusters.map((cluster) => (
          <TableRow key={cluster.id}>
            <TableCell>
              <Link href={`/nodes?cluster=${cluster.id}`} className="font-medium text-foreground hover:text-primary">
                {cluster.name}
              </Link>
              {cluster.description && (
                <p className="max-w-xs truncate text-xs text-muted-foreground">{cluster.description}</p>
              )}
            </TableCell>
            <TableCell>
              <StatusBadge status={cluster.status} />
            </TableCell>
            <TableCell className="tabular-nums">{cluster.health_score.toFixed(0)}%</TableCell>
            <TableCell className="tabular-nums">{nodeCounts[cluster.id] ?? 0}</TableCell>
            <TableCell className="text-muted-foreground">{cluster.location ?? "—"}</TableCell>
            <TableCell className="text-muted-foreground">{formatDateTime(cluster.created_at)}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                  <MoreHorizontal className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(cluster)}>
                    <Pencil className="size-3.5" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onClick={() => onDelete(cluster)}>
                    <Trash2 className="size-3.5" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
