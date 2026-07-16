<?php

namespace App\Http\Resources;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JadwalKegiatanResource extends JsonResource
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
            'name'=> $this->relasiKegiatanKeUser->name,
            'nama_kegiatan' => $this->nama_kegiatan,
            'jenis_kegiatan'=> $this->jenis_kegiatan,
            'tanggal' => $this->tanggal,
            'lokasi' => $this->lokasi,
            'status' => $this->status,
            'is_active' =>$this->is_active,
            'created_at' => Carbon::parse($this->created_at)->format('Y-m-d H:i:s'),
        ];
    }
}
