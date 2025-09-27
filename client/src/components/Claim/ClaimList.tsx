import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Typography,
} from "@mui/material";
import { formatDate } from "@/utils/validators.js";
import { Delete, Edit, Visibility } from "@mui/icons-material";
import { Claim } from "@/types";
interface ClaimListProps {
  claims: Claim[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  loading: Boolean;
  onDelete: (id: string) => void;
}
const ClaimList: React.FC<ClaimListProps> = ({ claims, onView, onEdit, onDelete }) => {
  if (claims.length === 0) {
    return (
      <Paper
        sx={{
          p: 3,
          textAlign: "center",
        }}
      >
        <Typography variant="body1" color="text.secondary">
          No claims found. Submit your first claim to get started.
        </Typography>
      </Paper>
    );
  }
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Policy ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Date</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {claims.map((claim) => (
            <TableRow key={claim._id}>
              <TableCell>{claim.policy.policyNumber}</TableCell>
              <TableCell>{claim.name}</TableCell>
              <TableCell>
                {claim.description.substring(0, 50)}
                {claim.description.length > 50 ? "..." : ""}
              </TableCell>
              <TableCell>
                <Chip label="Submitted" color="primary" size="small" />
              </TableCell>
              <TableCell>{claim.createdAt ? formatDate(claim.createdAt) : "-"}</TableCell>
              <TableCell align="center">
                <IconButton onClick={() => onView(claim._id!)} size="small" color="primary">
                  <Visibility />
                </IconButton>
                <IconButton onClick={() => onEdit(claim._id!)} size="small" color="default">
                  <Edit />
                </IconButton>
                <IconButton onClick={() => onDelete(claim._id!)} size="small" color="error">
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
export default ClaimList;
