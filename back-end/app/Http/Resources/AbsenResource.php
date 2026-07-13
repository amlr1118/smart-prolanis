<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class AbsenResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'kegiatanid' => $this->kegiatanid,
            'nama_kegiatan' => $this->relasikeKegiatan->nama_kegiatan,
            'pesertaid' => $this->pesertaid,
            'no_bpjs' => $this->relasikePeserta->no_bpjs,
            'nama_peserta' => $this->relasikePeserta->nama,
            'status_kehadiran' => $this->status_kehadiran,
            'stasiun' => $this->stasiun,
            'created_at' => Carbon::parse($this->created_at)->format('Y-m-d H:i:s'),
        ];
    }
}
