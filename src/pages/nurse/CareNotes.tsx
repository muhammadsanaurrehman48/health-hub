import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Plus, FileText, Clock, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/utils/api';

// Standard note types
const NOTE_TYPES = ['Observation', 'Vitals', 'Medication', 'Procedure', 'Incident', 'Discharge Planning', 'Other'];

const CareNotes: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isAddNoteDialogOpen, setIsAddNoteDialogOpen] = useState(false);
  const [noteType, setNoteType] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [careNotes, setCareNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.getAdmittedPatients();
      if (response.success) {
        setPatients(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    (patient.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (patient.mrNo?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddNote = () => {
    if (!noteType || !noteContent) {
      toast.error('Please fill in all fields');
      return;
    }
    toast.success('Care note added successfully');
    setIsAddNoteDialogOpen(false);
    setNoteType('');
    setNoteContent('');
  };

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case 'stable':
        return 'badge-completed';
      case 'improving':
        return 'badge-active';
      case 'critical':
        return 'badge-cancelled';
      default:
        return 'badge-pending';
    }
  };

  return (
    <DashboardLayout requiredRole="nurse">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Care Notes</h1>
          <p className="text-muted-foreground">Document patient care activities and observations</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Patient List */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="font-semibold mb-4">Select Patient</h3>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search patient..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedPatient?.id === patient.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/30 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{patient.name}</p>
                  </div>
                  <p className={`text-sm ${selectedPatient?.id === patient.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {patient.mrNo || 'MR-N/A'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Care Notes */}
          <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
            {selectedPatient ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedPatient.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedPatient.mrNo} | {selectedPatient.ward} - Bed {selectedPatient.bed}
                    </p>
                  </div>
                  <Button onClick={() => setIsAddNoteDialogOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Note
                  </Button>
                </div>

                <div className="space-y-4">
                  {careNotes.map((note) => (
                    <div key={note.id} className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium">
                            {note.type}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {note.time}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {note.nurse}
                        </span>
                      </div>
                      <p className="text-sm">{note.note}</p>
                    </div>
                  ))}
                  {careNotes.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">No care notes available. Add one to get started.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a patient to view and add care notes</p>
              </div>
            )}
          </div>
        </div>

        {/* Add Note Dialog */}
        <Dialog open={isAddNoteDialogOpen} onOpenChange={setIsAddNoteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Care Note</DialogTitle>
              <DialogDescription>
                Document care activity for {selectedPatient?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Note Type *</Label>
                <Select value={noteType} onValueChange={setNoteType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Note Content *</Label>
                <Textarea
                  placeholder="Enter care note details..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={5}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddNoteDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddNote}>Save Note</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default CareNotes;
